import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from 'leaflet';

import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useLocation } from 'react-router-dom';

import Button from "./Button";


function getColoredMarkerIcon(color) {
  return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
}

function mapColorFromOwner(city){
  if ((city.owners?.length || 0) > 1) return "gold";
  else if (city.owners?.[0]?.toLowerCase().includes("mark")) return "blue";
  else if (city.owners?.[0]?.toLowerCase().includes("parth")) return "green";
  else if (city.owners?.[0]?.toLowerCase().includes("damien")) return "red";
  else if (city.owners?.[0]?.toLowerCase().includes("jad")) return "violet";
  else if (city.owners?.[0]?.toLowerCase().includes("derek")) return "orange";
  else if (city.owners?.[0]?.toLowerCase().includes("tuoyo")) return "yellow";
  else return "grey";

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

  const location = useLocation();

  const randomKey = Math.random();


  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );

  useEffect(
    function () {
      if (geolocationPosition)
        setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
    },
    [geolocationPosition]
  );
  if (!cities) cities = [];
  return (
    <div className={styles.mapContainer}>
      {!geolocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      )}

      <MapContainer
        {...(location.pathname === '/app/profile' ? { key: randomKey } : {})}
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
        
        const markerColor = mapColorFromOwner(city);
        const customIcon = new L.Icon({
          iconUrl: getColoredMarkerIcon(markerColor),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
        });

        return (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city._id}
            icon={customIcon}
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
