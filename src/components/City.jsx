import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./City.module.css";
import { formatDate } from "../utils/dates";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "./BackButton";
import BackButtonRefresh from "./BackButtonRefresh";
import { uploadCityImageAPI, deleteCityImageAPI } from "../services/citiesService";

function City() {
  const { id } = useParams();
  const { getCity, currentCity, updateCity, fetchCities } = useCities();
  const { user } = useAuth();
  const location = useLocation();
  const visitor = location.state?.visitor;
  const isOwner = visitor === user?.username;
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);


  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageDeleteLoading, setImageDeleteLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  const galleryImages = Array.isArray(currentCity?.images) && currentCity.images.length > 0
    ? currentCity.images
    : [];

  useEffect(() => {
    getCity(id);
  }, [id, getCity]);

  useEffect(() => {
    if (currentCity) {
      setFormDate(currentCity.date ? new Date(currentCity.date).toISOString().split("T")[0] : "");
      setFormNotes(currentCity.notes || "");
    }
  }, [currentCity]);

  async function handleUpdateVisit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedNotes = formData.get("notes");
    const updatedDate = formData.get("date");
    const fixedDate = new Date(updatedDate + "T12:00:00Z");
    await updateCity(id, { notes: updatedNotes, date: fixedDate });
    await fetchCities();
    window.history.replaceState({}, document.title);
    e.target.reset();
  }

  async function handleAddImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageUploadLoading(true);
    setImageError("");
    try {
      for (const file of files) {
        await uploadCityImageAPI(id, file);
      }
      await getCity(id);
    } catch {
      setImageError("Failed to upload image(s). Please try again.");
    } finally {
      setImageUploadLoading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteImage(imageUrl) {
    setImageDeleteLoading(true);
    setImageError("");
    try {
      await deleteCityImageAPI(id, imageUrl);
      await getCity(id);
    } catch {
      setImageError("Failed to delete image. Please try again.");
    } finally {
      setImageDeleteLoading(false);
    }
  }

  const { cityName, emoji, date, notes } = currentCity || {};

  return (
    <div className={styles.city}>
      <div className={styles.row} style={{ alignItems: "center" }}>
        <h6>City Name</h6>
        <h3 style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>{emoji}</span>
          <span>
            <h3>{cityName}</h3>
          </span>
          {!showThumbnails && galleryImages.length > 0 &&(
            <button
              className={styles.button}
              onClick={() => {
                setShowThumbnails(true);
                setShowFullscreen(false);
              }}
            >
              Browse Pictures
            </button>
          )}

        </h3>
      </div>

      {isOwner && (
        <div className={styles.row} style={{ marginBottom: 16 }}>
          <label htmlFor="add-images" className={styles.uploadImagesButton}>
            Add Images
          </label>
          <input
            id="add-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImages}
            disabled={imageUploadLoading}
            style={{ display: "none" }}
          />
          {imageUploadLoading && (
            <span style={{ color: "#888", marginLeft: 8 }}>Uploading...</span>
          )}
        </div>
      )}
      {imageError && <div style={{ color: "red", marginBottom: 8 }}>{imageError}</div>}
      {showThumbnails && (
        <button
          className={styles.button}
          onClick={() => setShowThumbnails(false)}
          style={{ marginTop: '1rem' }}
        >
          Close Gallery
        </button>
      )}

      {showThumbnails && (
        <div className={styles.row} style={{ flexWrap: 'wrap', gap: '1rem' }}>
          {galleryImages.map((img, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={styles.galleryThumbnail}
                onClick={() => {
                  setGalleryIndex(index);
                  setShowFullscreen(true);
                }}
              />
              {isOwner && (
                <button
                  onClick={() => handleDeleteImage(img)}
                  disabled={imageDeleteLoading}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(255,0,0,0.8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showFullscreen && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setShowFullscreen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '85%',
              maxHeight: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[galleryIndex]}
              alt={`Gallery ${galleryIndex + 1}`}
              className={styles.fullscreenImage}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: 12 }}>
              <button
                onClick={() =>
                  setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)
                }
                className={styles.button}
              >
                ←
              </button>
              <button
                onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
                className={styles.button}
              >
                →
              </button>
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className={styles.button}
              style={{ marginTop: 12 }}
            >
              Close
            </button>
          </div>
        </div>
      )}



      
      <>
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
                  name="notes"
                />
              </div>
              <button type="submit" className={styles.saveBtn}>
                Save
              </button>
            </fieldset>
          </form>
        ) : (
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
            Check out {cityName} on Wikipedia →
          </a>
        </div>
      </>
      <div>{isOwner ? <BackButtonRefresh /> : <BackButton />}</div>
    </div>
  );
}

export default City;
