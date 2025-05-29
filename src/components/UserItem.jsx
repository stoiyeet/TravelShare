import styles from "./UserItem.module.css";
import { useState } from "react";
import CityList from "./CityList";

function UserItem({ visitor }) {
  const [expanded, setExpanded] = useState(false);

  const getColor = (name) => {
    if (!name) return "#ccc";
    const lower = name.toLowerCase();
    if (lower.includes("mark")) return "#3a2ef0";
    if (lower.includes("parth")) return "#1fbf2f";
    if (lower.includes("damien")) return "#c91a20";
    if (lower.includes("jad")) return "#b21ee8";
    if (lower.includes("derek")) return "#d68915";
    if (lower.includes("tuoyo")) return "#c4c21f";
    return "#aaa";
  };

  const color = getColor(visitor);

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
