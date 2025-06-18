import styles from "./UserItem.module.css";
import { useState } from "react";
import CityList from "./CityList";

function UserItem({ visitor, color }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className={`${styles.card} ${expanded ? styles.expanded : ""}`} onClick={() => setExpanded(!expanded)}>
  <div className={styles.header}>
    <div className={styles.colorBar} style={{ backgroundColor: color }}></div>
    <h3 className={styles.username}>{visitor}</h3>
  </div>

  {expanded && (
    <div className={styles.cities}>
      <CityList visitor={visitor} />
    </div>
  )}
</li>

  );
}

export default UserItem;
