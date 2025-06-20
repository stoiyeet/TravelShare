import { Link } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./CityItem.module.css";
import { formatDate } from "../utils/dates";
import { useAuth } from "../contexts/AuthContext";


function CityItem({ city, visitor }) {
  const { deleteCity } = useCities();
  const { user } = useAuth();

  const { cityName, emoji, date, _id: id, position } = city;

  function handleClick(e) {
    e.preventDefault();
    deleteCity(id);
  }

  return (
    <li>
      <Link
        className={`${styles.cityItem} ${
          id === cityName ? styles["cityItem--active"] : ""
        }`}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
        state={{ visitor }}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>({formatDate(date)})</time>
        {visitor === user.username && (
          <button className={styles.deleteBtn} onClick={handleClick}>
            &times;
          </button>
        )}

      </Link>
    </li>
  );
}

export default CityItem;
