import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCities } from "../contexts/CitiesContext";
import styles from "./City.module.css";
import { formatDate } from "../utils/dates";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import BackButton from "./BackButton";
import BackButtonRefresh from "./BackButtonRefresh";
import { uploadCityImageAPI, deleteCityImageAPI } from "../services/citiesService";

function City() {
  const { id } = useParams();
  const { getCity, currentCity, updateCity, fetchCities } = useCities();
  const { user } = useAuth();
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageDeleteLoading, setImageDeleteLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  // Use images from currentCity if available, otherwise empty array
  const galleryImages = currentCity?.images && Array.isArray(currentCity.images) && currentCity.images.length > 0
    ? currentCity.images
    : [];

  useEffect(() => {
    getCity(id);
  }, [id, getCity]);

  useEffect(() => {
    if (currentCity) {
      setFormDate(currentCity.date ? new Date(currentCity.date).toISOString().split("T")[0] : "");
      setFormNotes(currentCity.notes ? currentCity.notes : "");
    }
  }, [currentCity]);

  const { cityName, emoji, date, notes } = currentCity || {};
  const location = useLocation();
  const visitor = location.state?.visitor;

  async function handleUpdateVisit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedNotes = formData.get("notes");
    const updatedDate = formData.get("date");
    const fixedDate = new Date(updatedDate + "T12:00:00Z");
    updateCity(id, { notes: updatedNotes, date: fixedDate });
    await setTimeout(() => {}, 3000);
    fetchCities();
    window.history.replaceState({}, document.title); 
    e.target.reset();
  }

  // Handler for uploading images
  async function handleAddImages(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageUploadLoading(true);
    setImageError("");
    try {
      for (const file of files) {
        await uploadCityImageAPI(id, file);
      }
      await getCity(id); // Refresh city data
    } catch (err) {
      setImageError("Failed to upload image(s). Please try again.");
    } finally {
      setImageUploadLoading(false);
      e.target.value = "";
    }
  }

  // Handler for deleting an image
  async function handleDeleteImage(imageUrl) {
    setImageDeleteLoading(true);
    setImageError("");
    try {
      await deleteCityImageAPI(id, imageUrl);
      await getCity(id); // Refresh city data
    } catch (err) {
      setImageError("Failed to delete image. Please try again.");
    } finally {
      setImageDeleteLoading(false);
    }
  }

  const isOwner = visitor === user?.username;

  return (
    <div className={styles.city}>
      <div className={styles.row} style={{alignItems: 'center'}}>
        <h6>City Name</h6>
        <h3 style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span>{emoji}</span>
          <span><h3>{cityName}</h3></span>
          {galleryImages.length > 0 && (
            <button
              className={styles.button}
              onClick={() => setShowGallery(true)}
            >
              Browse Pictures
            </button>
          )}
        </h3>
      </div>
      {imageError && <div style={{ color: 'red', marginBottom: 8 }}>{imageError}</div>}
      {showGallery ? (
        <>
          {isOwner && (
            <div className={styles.row} style={{marginBottom: 16}}>
              <label htmlFor="add-images" style={{marginRight: 8}}>Add Images:</label>
              <input
                id="add-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImages}
                disabled={imageUploadLoading}
              />
              {imageUploadLoading && <span style={{ color: '#888', marginLeft: 8 }}>Uploading...</span>}
            </div>
          )}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 350, margin: '2rem 0', position: 'relative'
          }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24}}>
              <button
                onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}
                style={{
                  background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, cursor: 'pointer', marginRight: 16
                }}
                aria-label="Previous image"
                disabled={galleryImages.length === 0}
              >
                &#8592;
              </button>
              <div className={styles.galleryImages}>
                {galleryImages.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      className={styles.centerCropped}
                      src={galleryImages[galleryIndex]}
                      alt={`Gallery ${galleryIndex+1}`}
                    />
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteImage(galleryImages[galleryIndex])}
                        style={{
                          position: 'absolute', top: 8, right: 8, background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', zIndex: 2
                        }}
                        disabled={imageDeleteLoading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#fff', padding: 32 }}>No images available for this city.</span>
                )}
              </div>
              <button
                onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
                style={{
                  background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, cursor: 'pointer', marginLeft: 16
                }}
                aria-label="Next image"
                disabled={galleryImages.length === 0}
              >
                &#8594;
              </button>
            </div>
            <div style={{marginTop: 16, color: '#fff', fontWeight: 500}}>
              {galleryImages.length > 0 ? `${galleryIndex + 1} / ${galleryImages.length}` : '0 / 0'}
            </div>
            <button
              onClick={() => setShowGallery(false)}
              style={{marginTop: 24, background: '#fff', color: '#222', border: 'none', borderRadius: 6, padding: '0.4rem 1.2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <>
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
                    name = "notes"
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
        </>
      )}
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
