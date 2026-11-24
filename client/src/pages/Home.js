import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./home.css";

const heroSlides = [
  {
    image: "/images/munnar-tea-plantation.jpg",
    alt: "Tea plantations across the hills in Munnar, Kerala",
    name: "Munnar, Kerala",
    detail: "10.0889° N, 77.0595° E",
    credit: {
      name: "Rainer Halama",
      href: "https://commons.wikimedia.org/wiki/File:Munnar_Tea_Plantations-WUS07343-Pano.jpg",
      license: "CC BY-SA 4.0",
      licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
  },
  {
    image: "/images/udaipur-palace.jpg",
    alt: "Historic palace reflected in water in Udaipur",
    name: "Udaipur, Rajasthan",
    detail: "Palaces, old lanes and evenings glowing gold",
  },
  {
    image: "/images/ladakh-mountains.jpg",
    alt: "Dramatic mountain landscape in Ladakh",
    name: "Ladakh",
    detail: "High roads and a wide Himalayan horizon",
  },
  {
    image: "/images/kerala-backwaters.jpg",
    alt: "Traditional boat moving through Kerala backwaters",
    name: "Kerala",
    detail: "Backwater mornings and the slow rhythm of the coast",
  },
  {
    image: "/images/agra-taj-mahal.jpg",
    alt: "The Taj Mahal in soft morning light",
    name: "Agra, Uttar Pradesh",
    detail: "Marble poetry and Mughal gardens",
  },
];

const featuredDestinations = [
  {
    id: "udaipur",
    image: "/images/udaipur-palace.jpg",
    alt: "Historic palace reflected in water in Udaipur",
    region: "Rajasthan · 6 days",
    name: "Udaipur",
    description:
      "Palaces on still water, old lanes and evenings glowing gold.",
  },
  {
    id: "ladakh",
    image: "/images/ladakh-mountains.jpg",
    alt: "Dramatic mountain landscape in Ladakh",
    region: "Himalayas · 8 days",
    name: "Ladakh",
    description:
      "High roads, quiet monasteries and an endless blue horizon.",
  },
  {
    id: "kerala",
    image: "/images/kerala-backwaters.jpg",
    alt: "Traditional boat moving through Kerala backwaters",
    region: "South India · 7 days",
    name: "Kerala",
    description:
      "Backwater mornings, spice gardens and the slow rhythm of the coast.",
  },
  {
    id: "agra",
    image: "/images/agra-taj-mahal.jpg",
    alt: "The Taj Mahal in soft morning light",
    region: "Uttar Pradesh · 3 days",
    name: "Agra",
    description:
      "Marble poetry, Mughal gardens and the hush before sunrise.",
  },
];

const travelValues = [
  {
    number: "01",
    title: "Made for you",
    description:
      "No templates. Every journey reflects your pace, curiosity and idea of a good day.",
  },
  {
    number: "02",
    title: "Rooted locally",
    description:
      "Recommendations shaped by people who know the streets, seasons and stories first-hand.",
  },
  {
    number: "03",
    title: "Here throughout",
    description:
      "From the first spark to the journey home, your Sathi is only ever a message away.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const destinationTrack = useRef(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [destinationScroll, setDestinationScroll] = useState({
    canPrevious: false,
    canNext: false,
  });
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [plannerValues, setPlannerValues] = useState({
    destination: "",
    startDate: "",
    travelers: "2",
  });
  const [plannerMessage, setPlannerMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [heroIndex]);

  useEffect(() => {
    const track = destinationTrack.current;
    if (!track) return undefined;

    const updateScrollState = () => {
      setDestinationScroll({
        canPrevious: track.scrollLeft > 2,
        canNext: track.scrollLeft + track.clientWidth < track.scrollWidth - 2,
      });
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash) {
      document.getElementById(hash)?.scrollIntoView();
    }
  }, [location.hash]);

  const moveDestinations = (direction) => {
    const track = destinationTrack.current;
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return;

    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;

    track.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  const planDestination = (destination) => {
    navigate("/trip-planner", {
      state: { plannerIntent: { destination: destination.name } },
    });
  };

  const toggleSavedDestination = (destinationId) => {
    setSavedDestinations((current) => {
      const next = current.includes(destinationId)
        ? current.filter((id) => id !== destinationId)
        : [...current, destinationId];

      return next;
    });
  };

  const updatePlannerField = (event) => {
    const { name, value } = event.target;
    setPlannerValues((current) => ({ ...current, [name]: value }));
    setPlannerMessage("");
  };

  const submitPlanner = (event) => {
    event.preventDefault();
    const destination = plannerValues.destination.trim();

    if (!destination || !plannerValues.startDate) {
      setPlannerMessage("Choose a destination and travel date to continue.");
      return;
    }

    navigate("/trip-planner", {
      state: {
        plannerIntent: {
          destination,
          startDate: plannerValues.startDate,
          travelers: Number(plannerValues.travelers),
        },
      },
    });
  };

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const currentHero = heroSlides[heroIndex];

  return (
    <div className="home-landing" id="top">
      <main>
        <section className="hero" aria-labelledby="hero-title">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.image}
              className={`hero-image${index === heroIndex ? " active" : ""}`}
              src={slide.image}
              alt={index === heroIndex ? slide.alt : ""}
              aria-hidden={index !== heroIndex}
            />
          ))}
          <div className="hero-shade" aria-hidden="true" />

          <div className="hero-content">
            <p className="eyebrow light">India, at your own pace</p>
            <h1 id="hero-title">
              Go where you
              <br />
              <em>feel most alive.</em>
            </h1>
            <p className="hero-copy">
              Thoughtful journeys, shaped around you. Discover places that stay
              with you long after you return.
            </p>
          </div>

          <div className="hero-note">
            <span>{String(heroIndex + 1).padStart(2, "0")}</span>
            <p>
              <strong>{currentHero.name}</strong>
              <br />
              {currentHero.detail}
              {currentHero.credit && (
                <small>
                  Photo:{" "}
                  <a
                    href={currentHero.credit.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {currentHero.credit.name}
                  </a>{" "}
                  ·{" "}
                  <a
                    href={currentHero.credit.licenseHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {currentHero.credit.license}
                  </a>
                </small>
              )}
            </p>
          </div>

          <div className="scroll-note" aria-hidden="true">
            <span />
            Scroll to wander
          </div>
        </section>

        <section className="intro section-shell">
          <div>
            <p className="eyebrow">Made for curious people</p>
            <h2>
              Not just a trip.
              <br />
              <em>Your story, unfolding.</em>
            </h2>
          </div>
          <div className="intro-copy">
            <p>
              We believe the best journeys aren&apos;t rushed. They&apos;re
              filled with wrong turns, long lunches, hidden paths and stories
              worth bringing home.
            </p>
            <a className="arrow-link" href="#why-us">
              How TripSathi works <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="destinations section-shell" id="destinations">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A place for every feeling</p>
              <h2>
                Where will you{" "}
                <em>go next?</em>
              </h2>
            </div>
            <div className="slider-controls" aria-label="Destination controls">
              <button
                type="button"
                aria-label="Previous destinations"
                onClick={() => moveDestinations(-1)}
                disabled={!destinationScroll.canPrevious}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next destinations"
                onClick={() => moveDestinations(1)}
                disabled={!destinationScroll.canNext}
              >
                →
              </button>
            </div>
          </div>

          <div className="destination-track" ref={destinationTrack}>
            {featuredDestinations.map((destination) => {
              const isSaved = savedDestinations.includes(destination.id);

              return (
                <article
                  className="destination-card"
                  key={destination.id}
                >
                  <img src={destination.image} alt={destination.alt} />
                  <button
                    className="destination-card__plan"
                    type="button"
                    aria-label={`Plan a journey to ${destination.name}`}
                    onClick={() => planDestination(destination)}
                  />
                  <button
                    className={`save-button${isSaved ? " saved" : ""}`}
                    type="button"
                    aria-label={`${isSaved ? "Unsave" : "Save"} ${destination.name}`}
                    aria-pressed={isSaved}
                    onClick={() => toggleSavedDestination(destination.id)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                    </svg>
                  </button>
                  <div className="card-caption">
                    <span>{destination.region}</span>
                    <h3>{destination.name}</h3>
                    <p>{destination.description}</p>
                    <span className="destination-card__cta">
                      Plan this journey <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="planner" id="planner">
          <div className="planner-copy">
            <p className="eyebrow light">Your journey starts here</p>
            <h2>
              Tell us what moves you.
              <br />
              <em>We&apos;ll map the rest.</em>
            </h2>
          </div>

          <form className="planner-form" onSubmit={submitPlanner}>
            <label>
              <span>Where do you want to go?</span>
              <input
                name="destination"
                type="text"
                placeholder="A city, a feeling, anywhere..."
                value={plannerValues.destination}
                onChange={updatePlannerField}
                autoComplete="address-level2"
                required
              />
            </label>
            <label>
              <span>When?</span>
              <input
                name="startDate"
                type="date"
                value={plannerValues.startDate}
                onChange={updatePlannerField}
                min={today.toISOString().slice(0, 10)}
                required
              />
            </label>
            <label>
              <span>Travellers</span>
              <select
                name="travelers"
                value={plannerValues.travelers}
                onChange={updatePlannerField}
              >
                <option value="2">2 people</option>
                <option value="1">1 person</option>
                <option value="3">3–5 people</option>
                <option value="6">6+ people</option>
              </select>
            </label>
            <button className="plan-submit" type="submit">
              Create my journey
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
            <p className="form-message" role="status" aria-live="polite">
              {plannerMessage}
            </p>
          </form>
        </section>

        <section className="journal section-shell" id="journeys">
          <div className="journal-heading">
            <p className="eyebrow">Stories from the road</p>
            <h2>
              The TripSathi <em>Journal</em>
            </h2>
          </div>

          <article className="journal-feature" id="journal">
            <div className="journal-image">
              <img
                src="/images/parvati-valley.jpg"
                alt="Mountain road winding through the Himalayas"
              />
              <span>Field Notes 04</span>
            </div>
            <div className="journal-copy">
              <p className="eyebrow">A slower way through Himachal</p>
              <h3>
                Finding silence
                <br />
                in the <em>Parvati Valley</em>
              </h3>
              <p>
                Beyond the familiar trail lies a quieter rhythm—cedar forests,
                small village kitchens, and mornings measured in cups of chai.
              </p>
              <a className="arrow-link" href="#journal">
                Read the story <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </section>

        <section className="values" id="why-us">
          <p className="eyebrow">Why travel with us</p>
          <div className="value-grid">
            {travelValues.map((value) => (
              <article key={value.number}>
                <span>{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-main">
          <div>
            <a className="footer-brand" href="#top">
              TripSathi
            </a>
            <p>Travel, thoughtfully.</p>
          </div>
          <div className="footer-links">
            <div>
              <span>Explore</span>
              <a href="#destinations">Destinations</a>
              <a href="#journeys">Journal</a>
              <a href="#planner">Plan a journey</a>
            </div>
            <div>
              <span>Follow</span>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://pinterest.com/" target="_blank" rel="noreferrer">Pinterest</a>
              <a href="https://youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TripSathi</span>
          <span>Made with care in India</span>
          <span>Privacy</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
