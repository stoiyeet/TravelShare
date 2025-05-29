import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./City.module.css";
import { formatDate } from "../utils/dates";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import BackButton from "./BackButton";
import BackButtonRefresh from "./BackButtonRefresh";

function City() {
  const { id } = useParams();
  const { getCity, currentCity, isLoading, updateCity } = useCities();
  const { user } = useAuth();
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    getCity(id);
  }, [id, getCity]);

  useEffect(() => {
  if (currentCity) {
    setFormDate(currentCity.date ? new Date(currentCity.date).toISOString().split("T")[0] : "");
    setFormNotes(currentCity.notes || "");
  }
}, [currentCity]);


  const { cityName, emoji, date, notes } = currentCity || {};
  const location = useLocation();
  const visitor = location.state?.visitor;

  function handleUpdateVisit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedNotes = formData.get("notes");
    const updatedDate = formData.get("date");
    updateCity(id, { notes: updatedNotes, date: updatedDate });
    e.target.reset();
  }

  const isOwner = visitor === user?.username;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City Name</h6>
        <h3>
          <span>{emoji}</span> {cityName}
        </h3>
      </div>

      {/* Only show notes and edit form if visitor matches user */}
      {isOwner ? (
        <form onSubmit={handleUpdateVisit} className={styles.form}>
          <h6>You visited on</h6>
          <p>{formatDate(date || null)}</p>
          <fieldset className={styles.formGroup}>
            <legend>Update Visit Info</legend>

            <div className={styles.row}>
              <label htmlFor="date">Change the visit date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className={styles.row}>
              <label htmlFor="notes">Your notes:</label>
              <input
                type="text"
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Type your notes here..."
              />
            </div>

            <button type="submit" className={styles.saveBtn}>Save</button>
          </fieldset>
        </form>
      ) : (
        // If not owner, just show notes in read-only mode or hide if you prefer
        <div className={styles.row}>
          <h6>{visitor} visited on</h6>
          <p>{formatDate(date || null)}</p>
          <h6>{visitor}'s Notes</h6>
          <p>{notes || "No notes available."}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        {isOwner ? (
          <BackButtonRefresh />
        ) : (
          <BackButton />
        )}
      </div>
    </div>
  );
}

export default City;
