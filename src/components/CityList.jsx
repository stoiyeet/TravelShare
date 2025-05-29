import Spinner from "./Spinner";
import styles from "./CityList.module.css";
import CityItem from "./CityItem";
import Message from "./Message";
import { useCities } from "../contexts/CitiesContext";

function CityList({visitor}) {
  const { cities, isLoading } = useCities();

    // Filter cities that belong to this visitor
  const userCities = cities.filter(city =>
    Array.isArray(city.owners) && city.owners.includes(visitor)
  );

  if (isLoading) return <Spinner />;

  if (!userCities.length)
    return (
        <Message message={`${visitor} has not visited any cities yet? DAMN`} />
    );

  return (
    <ul className={styles.cityList}>
      {userCities.map((city) => (
        <CityItem city={city} key={city._id} visitor = {visitor} />
      ))}
    </ul>
  );
}

export default CityList;
