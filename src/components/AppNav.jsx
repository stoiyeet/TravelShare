import { NavLink } from "react-router-dom";
import styles from "./AppNav.module.css";

function AppNav() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <NavLink to="groups">Groups</NavLink>
        </li>
        <li>
          <NavLink to="cities">Cities</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AppNav;
