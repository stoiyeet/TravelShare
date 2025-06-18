import styles from "./UserList.module.css";
import UserItem from "./UserItem";
import { useCities } from "../contexts/CitiesContext";
import Message from "./Message";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";




function UserList() {
  const { cities, isLoading, fetchCities } = useCities();
  const visitors = [...new Set(cities.flatMap(city => city.owners.map(owner => owner.username)))];
  const location = useLocation();
  const shouldRefresh = location.state?.refresh;

  useEffect(() => {
if (shouldRefresh) {
    fetchCities();
    // Optionally clear the state afterward to prevent it from firing again
    window.history.replaceState({}, document.title); 
}
}, [shouldRefresh]);

  if (!visitors.length)
    return (
      <Message message="No Cities have been visited yet?" />
    );

  // Create a map of username to color
  const visitorColors = {};
  cities.forEach(city => {
    city.owners.forEach(owner => {
      if (!visitorColors[owner.username]) {
        visitorColors[owner.username] = owner.color;
      }
    });
  });

  return (
    <ul className={styles.cityList}>
      {visitors.map((visitor) => (
        <UserItem key={visitor} visitor={visitor} color={visitorColors[visitor]} />
    ))}
    </ul>
  );
}

export default UserList;
