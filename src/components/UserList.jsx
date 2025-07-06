import styles from "./UserList.module.css";
import UserItem from "./UserItem";
import { useFilteredCities } from "../hooks/useFilteredCities";
import Message from "./Message";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";




function UserList() {
  let { cities, fetchCities, activeGroup } = useFilteredCities();
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
    activeGroup = cities.map(city => city.owners?.[0]).filter(Boolean);
  }

  if (!visitors.length)
    return (
      <Message message={`No cities have been visited by members of "${activeGroup.name}" yet`} />
    );

  // Create a map of username to color from the active group
  const visitorColors = {};
  if (activeGroup && activeGroup.members) {
    activeGroup.members.forEach(member => {
      const memberUsername = typeof member === 'string' ? member : member.username;
      const memberColor = typeof member === 'string' ? "#000" : member.color;
      visitorColors[memberUsername] = memberColor;
    });
  }


  return (
    <ul className={styles.cityList}>
      {visitors.map((visitor) => (
        <UserItem key={visitor} visitor={visitor} color={visitorColors[visitor]} />
    ))}
    </ul>
  );
}

export default UserList;
