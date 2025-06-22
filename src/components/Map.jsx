import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getGeocode } from "../services/citiesService";


import Button from "./Button";

function getColoredMarkerIcon(color) {
  if (!color){
    color = "000";
  };
  const cleanedColor = color.replace(/^#+|#+$/g, '');
  return `/Colours/${cleanedColor}.png`;
}

function mapColorFromOwner(city, user) {
  if (city.owners?.length > 0) return city.owners[0].color;
  else return user?.color || "000";
}

function Map() {
  let { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const {
    isLoading: isLoadingPosition,
    position: geolocationPosition,
    getPosition,
  } = useGeolocation();
  const [mapLat, mapLng] = useUrlPosition();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);


  const location = useLocation();

  const randomKey = Math.random();

  const [searchCity, setSearchCity] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchCity) return;

    try {
      const { lat, lng } = await getGeocode(searchCity);
      const variance = 0.01;
      const adjLat = lat + (Math.random() * 2 - 1) * variance;
      const adjLng = lng + (Math.random() * 2 - 1) * variance;
      navigate(`form?lat=${adjLat}&lng=${adjLng}`);
    } catch (err) {
      console.error("Error during geocoding:", err);
      // You can add a user notification here if desired
    }
  }

  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng],
  );

    useEffect(
      function () {
        if (geolocationPosition)
          setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
      },
      [geolocationPosition],
    );
    if (!cities) cities = [];
      return (
      <div className={styles.mapContainer}>
        <div className={`${styles.searchControl} ${showSearch ? styles.showSearch : ''}`}>
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={searchCity}
        onChange={(e) => setSearchCity(e.target.value)}
        placeholder="Search for a city"
        className={styles.searchInput}
        autoFocus
      />
      <Button
        type="position"
        id="searchButton"
        onClick={(e) => {
          if(!showSearch)
          { 
            e.preventDefault();
          }
          setShowSearch(!showSearch);
        }}
      >
        {showSearch ? "Search" : "🔍"}
      </Button>
    </form>
  </div>

    <div className={styles.positionControls}>
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      )}
    </div>

      <MapContainer
        {...(location.pathname === "/app/profile" ? { key: randomKey } : {})}
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => {
          const markerColor = mapColorFromOwner(city, user);
          const customIcon = new L.Icon({
            iconUrl: getColoredMarkerIcon(markerColor),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
          });

          return (
            <Marker
              position={[city.position.lat, city.position.lng]}
              key={city._id}
              icon={customIcon}
              eventHandlers={{
              click: () => {
                navigate(
                  `cities/${city._id}?lat=${city.position.lat}&lng=${city.position.lng}`,
                  city.owners?.[0].username !== user.username
                    ? { state: { visitor: city.owners?.[0].username } }
                    : undefined
                );
              }
            }}
            >
              <Popup>
                <span>{city.emoji}</span> <span>{city.cityName}</span>
              </Popup>
            </Marker>
          );
        })}

        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}

function DetectClick() {
  const navigate = useNavigate();

  useMapEvents({
    click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
  });
}

export default Map;
