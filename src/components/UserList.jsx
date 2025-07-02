import styles from "./UserList.module.css";
import UserItem from "./UserItem";
import { useFilteredCities } from "../hooks/useFilteredCities";
import Message from "./Message";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";




function UserList() {
  const { cities, fetchCities, activeGroup } = useFilteredCities();
  const visitors = [...new Set(cities.flatMap(city => (city.owners || []).map(owner => owner.username)))];
  const location = useLocation();
  const shouldRefresh = location.state?.refresh;

  useEffect(() => {
if (shouldRefresh) {
    fetchCities();
    // Optionally clear the state afterward to prevent it from firing again
    window.history.replaceState({}, document.title); 
}
}, [shouldRefresh]);

  if (!activeGroup) {
    return (
      <Message message="Please select a group to view cities" />
    );
  }

  if (!visitors.length)
    return (
      <Message message={`No cities have been visited by members of "${activeGroup.name}" yet`} />
    );

  // Create a map of username to color
 const visitorColors = {};
cities.forEach(city => {
  (city.owners || []).forEach(owner => {
    if (owner?.username && !visitorColors[owner.username]) {
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
