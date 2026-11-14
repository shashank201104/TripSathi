import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import SeoHead from "../components/seo/SeoHead";
import destinations from "../data/destinations.json";
import articles from "../data/articles.json";
import { ARTICLE_PATH, DESTINATION_PATH, SITE_URL } from "../data/site";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
    <SeoHead
      title="TripSathi | Thoughtful Travel Planning"
      description="Explore practical India destination guides and create an AI-assisted travel itinerary shaped around your dates, budget, and interests."
      canonical={`${SITE_URL}/`}
      image="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85"
      preloadImage
      structuredData={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "TripSathi",
          url: SITE_URL,
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TripSathi",
          url: SITE_URL,
          inLanguage: "en",
        },
      ]}
    />
    <main className="page-bg">
      <div className="page-container relative space-y-12 py-6 md:space-y-16 md:py-8">
        <section className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 lg:order-1"
          >
            <p className="section-label mb-5">Travel, planned around you</p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] md:text-6xl">
              Your next trip,{" "}
              <span className="text-accent">thoughtfully planned.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-text-secondary md:text-lg">
              Tell us where you want to go. TripSathi shapes the route, the
              rhythm and the details—so you can simply travel.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/plan/"
                className="btn-primary min-w-36"
              >
                Plan a Trip <FaArrowRight className="ml-2 h-3 w-3" />
              </Link>
              <Link to="/login" className="btn-outline min-w-36">
                Sign in
              </Link>
            </div>
            <div className="mt-9 flex max-w-md items-center justify-between border-t border-border pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary">
              <span>Delhi</span>
              <FaArrowRight className="text-accent-secondary" />
              <span>Kyoto</span>
              <span>7 days</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="home-hero-photo order-1 flex min-h-[340px] items-end overflow-hidden rounded-lg p-6 text-white sm:min-h-[440px] sm:p-8 lg:order-2 lg:min-h-[560px]"
            role="img"
            aria-label="A quiet street in Kyoto at dusk"
          >
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-white/80">
                DELHI → KYOTO · 7 DAYS
              </p>
              <h2 className="max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">
                A quieter way to see the world.
              </h2>
            </div>
          </motion.div>
        </section>

        <section aria-labelledby="destinations-title">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="section-label mb-2">Places worth the journey</p>
              <h2 id="destinations-title" className="text-2xl font-bold md:text-3xl">
                Go somewhere that stays with you.
              </h2>
            </div>
            <Link
              to="/destinations/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-secondary"
            >
              Start exploring <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {destinations.map((destination, index) => (
              <Link
                key={destination.slug}
                to={DESTINATION_PATH(destination.slug)}
                className={`group relative flex min-h-52 items-end overflow-hidden rounded-lg bg-surface p-5 text-white transition-transform duration-300 hover:-translate-y-1 sm:min-h-64 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <img
                  src={destination.image}
                  alt={destination.imageAlt}
                  width="960"
                  height="600"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="relative text-2xl font-bold text-white md:text-3xl">
                  {destination.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="travel-guides-title">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="section-label mb-2">Plan with context</p>
              <h2 id="travel-guides-title" className="text-2xl font-bold md:text-3xl">
                Practical travel guides
              </h2>
            </div>
            <Link
              to="/blog/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-secondary"
            >
              All articles <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="grid gap-3 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <li key={article.slug} className="surface-card p-5">
                <Link
                  to={ARTICLE_PATH(article.slug)}
                  className="font-bold text-text-primary hover:text-accent"
                >
                  {article.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {article.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
    </>
  );
};

export default Home;
