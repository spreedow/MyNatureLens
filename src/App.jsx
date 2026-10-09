import "./App.css";
import { useEffect, useRef, useState } from "react";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";

import photo1 from "./assets/photos/IMG_20240425_220604.jpg";
import photo2 from "./assets/photos/IMG20260923091711.jpg";
import photo3 from "./assets/photos/IMG20260923091744.jpg";
import photo4 from "./assets/photos/IMG20260923093003.jpg";
import photo5 from "./assets/photos/Picsart_26-09-20_10-05-25-408.jpg";
import photo6 from "./assets/photos/Picsart_26-09-20_10-07-27-188.jpg";

function App() {
  const [showAuth, setShowAuth] = useState(() => {
  return (
    window.location.hash.includes("type=recovery") ||
    new URLSearchParams(window.location.search).get("type") === "recovery"
  );
});

const [user, setUser] = useState(null);
useEffect(() => {
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  getUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);

    if (event === "SIGNED_IN") {
      setShowAuth(false);
    }
  });

  return () => subscription.unsubscribe();
}, []);


  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [accountMessage, setAccountMessage] = useState("");

  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [description, setDescription] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [communityPhotos, setCommunityPhotos] = useState([]);
const [uploadMessage, setUploadMessage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const submissionLock = useRef(false);

const loadCommunityPhotos = async () => {
  const { data, error } = await supabase
    .from("photos")
    .select("id, user_id, title, description, image_url");

  if (error) {
    console.error("Could not load community photos:", error.message);
    return;
  }

  setCommunityPhotos(
    (data || [])
      .filter((photo) => photo.image_url)
      .map((photo) => ({
        image: photo.image_url,
        title: photo.title || "Nature Photo",
        description: photo.description || "",
        id: photo.id,
        userId: photo.user_id,
        isCommunityPhoto: true,
      }))
  );
};

useEffect(() => {
  loadCommunityPhotos();
}, []);

const handlePhotoSubmit = async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;

  // A ref blocks rapid repeated clicks before React updates button state.
  if (submissionLock.current) return;

  submissionLock.current = true;
  setIsSubmitting(true);
  setUploadMessage("");

  try {
    if (!user) {
      setUploadMessage("Please log in before submitting a photo.");
      return;
    }

    if (!selectedFile) {
      setUploadMessage("Please choose a photo.");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setUploadMessage("Please choose a valid image file.");
      return;
    }

    setUploadMessage("Uploading your photo...");

    const fileExtension = selectedFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, selectedFile, { upsert: false });

    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // This is the only database insert for one submission.
    const { error: databaseError } = await supabase
      .from("photos")
      .insert({
        user_id: user.id,
        title: name.trim() || "Nature Photo",
        description: description.trim(),
        image_url: publicUrl,
      });

    if (databaseError) {
      throw new Error(
        `Photo uploaded, but saving its information failed: ${databaseError.message}`
      );
    }

    await loadCommunityPhotos();
    setUploadMessage("🌿 Your photo was submitted successfully!");
    setName("");
    setEmail("");
    setDescription("");
    setSelectedFile(null);
    formElement.reset();
  } catch (error) {
    setUploadMessage(error?.message || "Something went wrong. Please try again.");
  } finally {
    submissionLock.current = false;
    setIsSubmitting(false);
  }
};

const handleDeletePhoto = async (photo) => {
  if (!user || !photo?.id || photo.userId !== user.id) {
    setAccountMessage("You can delete only photos uploaded by your own account.");
    return;
  }

  const confirmed = window.confirm("Delete this photo permanently? This cannot be undone.");
  if (!confirmed) return;

  setDeletingPhotoId(photo.id);
  setAccountMessage("");

  try {
    // Public Storage URLs contain the object path after this marker.
    const marker = "/storage/v1/object/public/photos/";
    const markerIndex = photo.image.indexOf(marker);
    if (markerIndex === -1) {
      throw new Error("Could not identify this photo's storage path.");
    }
    const storagePath = decodeURIComponent(photo.image.slice(markerIndex + marker.length));

    // Remove the image first. If Storage denies deletion, keep the database row.
    const { error: storageError } = await supabase.storage
      .from("photos")
      .remove([storagePath]);

    if (storageError) {
      throw new Error(`Could not delete the image file: ${storageError.message}`);
    }

    const { error: rowError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", user.id);

    if (rowError) {
      throw new Error(`Image deleted, but its database record could not be deleted: ${rowError.message}`);
    }

    await loadCommunityPhotos();
    setAccountMessage("Photo deleted successfully.");
    setSelectedPhoto(null);
  } catch (error) {
    setAccountMessage(error?.message || "Could not delete this photo.");
  } finally {
    setDeletingPhotoId(null);
  }
};

  const featuredPhotos = [
    { image: photo1, title: "Nature Moment" },
    { image: photo2, title: "Natural Beauty" },
    { image: photo3, title: "Details of Nature" },
    { image: photo4, title: "Wild Landscape" },
    { image: photo5, title: "Through My Lens" },
    { image: photo6, title: "A Moment in Nature" },
  ];

  // Show both the original featured photos and photos submitted by visitors.
  const photos = [...featuredPhotos, ...communityPhotos];

  const currentIndex = selectedPhoto
    ? photos.findIndex((photo) => photo.image === selectedPhoto.image)
    : -1;

  const showPrevious = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    }
  };

  const showNext = () => {
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    }
  };

  return (
    <div className="site">

      {/* Header */}
      <header className="header">
        <div className="logo">
          🌿 <span>MyNatureLens</span>
        </div>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About</a>
          <a href="#share">📷 Share Your Photo</a>

          {user ? (
            <>
              <button className="auth-button" onClick={() => { setAccountMessage(""); setShowAccount(true); }}>
                👤 My Account
              </button>
              <button className="auth-button" onClick={async () => { await supabase.auth.signOut(); setShowAccount(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <button className="auth-button" onClick={() => setShowAuth(true)}>
              🌿 Login / Sign Up
            </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      <main id="home">

        <section className="hero-section">
          <div className="hero-text">
            <p className="welcome">WELCOME TO MYNATURELENS</p>

            <h1>
              See Nature Through
              <br />
              Everyone's Lens
            </h1>

            <p className="hero-description">
              Discover beautiful moments from the natural world,
              captured through photography.
            </p>

            <div className="hero-buttons">
              <a href="#gallery" className="button primary">
                🌸 Explore Gallery
              </a>

              <a href="#share" className="button secondary">
                📷 Share Your Photo
              </a>
            </div>
          </div>
        </section>

        {/* Featured Nature */}
        <section id="gallery" className="section">
          <p className="section-label">EXPLORE</p>

          <h2>🌿 Featured Nature</h2>

          <p className="section-description">
            Discover the beauty of nature through photography.
          </p>

          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                className="photo-card"
                key={index}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
  src={photo.image}
  alt={photo.title}
  loading="lazy"
  decoding="async"
/>

                <div className="photo-title">
                  {photo.title}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="about-section">
          <div>
            <p className="section-label">ABOUT</p>

            <h2>
              See the world through a different lens.
            </h2>

            <p>
              MyNatureLens is a place where the beauty of nature
              is captured through photography.
            </p>

            <p>
              From flowers and tiny details to landscapes and changing
              skies, every photograph tells a story.
            </p>
          </div>
        </section>

        {/* Share */}
        <section id="share" className="share-section">
          <p className="section-label">COMMUNITY</p>

          <h2>📸 Your Nature, Your Story</h2>

          <p>
            Have you captured a beautiful moment in nature?
            Share your photograph with the MyNatureLens community.
          </p>

          <button
            className="share-button"
            onClick={() => {
  if (!user) {
    setShowAuth(true);
    return;
  }

  setShowForm(true);
}}
          >
            📷 Submit Your Photo
          </button>
        </section>

      </main>
      {/* Authentication Popup */}
{showAuth && (
  <div
    className="submission-overlay"
    onClick={() => setShowAuth(false)}
  >
    <div
      className="submission-form"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="submission-close"
        onClick={() => setShowAuth(false)}
        aria-label="Close login"
      >
        ×
      </button>

      <Auth />
    </div>
  </div>
)}

      {/* My Account / My Photos */}
      {showAccount && user && (
        <div className="submission-overlay" onClick={() => setShowAccount(false)}>
          <div className="submission-form" onClick={(event) => event.stopPropagation()}>
            <button className="submission-close" onClick={() => setShowAccount(false)} aria-label="Close account">×</button>
            <p className="section-label">MYNATURELENS</p>
            <h2>👤 My Account</h2>
            <p><strong>Email:</strong> {user.email || "Email unavailable"}</p>
            <p><strong>My uploaded photos:</strong> {communityPhotos.filter((photo) => photo.userId === user.id).length}</p>
            {accountMessage && <p role="status" aria-live="polite">{accountMessage}</p>}

            <h3>📷 My Photos</h3>
            {communityPhotos.filter((photo) => photo.userId === user.id).length === 0 ? (
              <p>You haven't uploaded any photos with this account yet. New uploads will appear here.</p>
            ) : (
              <div className="photo-grid">
                {communityPhotos.filter((photo) => photo.userId === user.id).map((photo) => (
                  <div className="photo-card" key={photo.id}>
                    <img src={photo.image} alt={photo.title} loading="lazy" decoding="async" />
                    <div className="photo-title">{photo.title}</div>
                    {photo.description && <p>{photo.description}</p>}
                    <button
                      type="button"
                      className="auth-button"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => handleDeletePhoto(photo)}
                    >
                      {deletingPhotoId === photo.id ? "Deleting..." : "🗑️ Delete Photo"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Submission Form */}
      {showForm && (
        <div
          className="submission-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="submission-form"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="submission-close"
              onClick={() => setShowForm(false)}
              aria-label="Close submission form"
            >
              ×
            </button>

            <p className="section-label">COMMUNITY</p>

            <h2>📷 Share Your Nature Photo</h2>

            <p className="submission-intro">
              Tell us about your photograph and share your moment
              with the MyNatureLens community.
            </p>

            <form onSubmit={handlePhotoSubmit}>
              <label>
                <input
  type="text"
  placeholder="Enter your name"
  value={name}
  onChange={(event) => setName(event.target.value)}
/>
              </label>

              <label>
                Email
                <input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>
              </label>

              <label>
                Choose Your Photo
                <input
  type="file"
  accept="image/*"
  onChange={(event) => setSelectedFile(event.target.files[0])}
/>
              </label>

              <label>
                Tell Us About Your Photo
                <textarea
  placeholder="Tell us about the moment you captured..."
  rows="5"
  value={description}
  onChange={(event) => setDescription(event.target.value)}
></textarea>
              </label>

              <button
                type="submit"
                className="submit-photo-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "📤 Submit Photo"}
              </button>

              {uploadMessage && (
                <p role="status" aria-live="polite">
                  {uploadMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="lightbox"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photo"
          >
            ×
          </button>

          {/* Previous Button */}
          <button
            className="lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            disabled={currentIndex === 0}
            aria-label="Previous photo"
          >
            ←
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
            />

            <h3>{selectedPhoto.title}</h3>
          </div>

          {/* Next Button */}
          <button
            className="lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            disabled={currentIndex === photos.length - 1}
            aria-label="Next photo"
          >
            →
          </button>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>🌿 MyNatureLens</p>

        <small>
          See Nature through everyone's lens.
        </small>
      </footer>

    </div>
  );
}

export default App;