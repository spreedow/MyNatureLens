import "./App.css";
import { useState } from "react";
import Auth from "./Auth";

import photo1 from "./assets/photos/IMG_20240425_220604.jpg";
import photo2 from "./assets/photos/IMG20260923091711.jpg";
import photo3 from "./assets/photos/IMG20260923091744.jpg";
import photo4 from "./assets/photos/IMG20260923093003.jpg";
import photo5 from "./assets/photos/Picsart_26-09-20_10-05-25-408.jpg";
import photo6 from "./assets/photos/Picsart_26-09-20_10-07-27-188.jpg";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const photos = [
    { image: photo1, title: "Nature Moment" },
    { image: photo2, title: "Natural Beauty" },
    { image: photo3, title: "Details of Nature" },
    { image: photo4, title: "Wild Landscape" },
    { image: photo5, title: "Through My Lens" },
    { image: photo6, title: "A Moment in Nature" },
  ];

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

          <button
  className="auth-button"
  onClick={() => setShowAuth(true)}
>
  🌿 Login / Sign Up
</button>
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
            onClick={() => setShowForm(true)}
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

            <form>
              <label>
                Your Name
                <input
                  type="text"
                  placeholder="Enter your name"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  placeholder="Enter your email"
                />
              </label>

              <label>
                Choose Your Photo
                <input
                  type="file"
                  accept="image/*"
                />
              </label>

              <label>
                Tell Us About Your Photo
                <textarea
                  placeholder="Tell us about the moment you captured..."
                  rows="5"
                ></textarea>
              </label>

              <button
                type="button"
                className="submit-photo-button"
                onClick={() => {
                  alert(
                    "Your photo submission form is ready. We will connect it to the MyNatureLens upload system next."
                  );
                }}
              >
                📤 Submit Photo
              </button>
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