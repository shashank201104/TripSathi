import { Link } from "react-router-dom";
import SeoHead from "../components/seo/SeoHead";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import destinations from "../data/destinations.json";
import { DESTINATION_PATH, SITE_URL } from "../data/site";

const pageUrl = `${SITE_URL}/destinations/`;
const pageTitle = "India Destination Guides | TripSathi";
const pageDescription =
  "Explore practical TripSathi guides to Jaipur, Ladakh, and Kerala, with sights, seasonal planning, transport notes, and budget estimates.";

const Destinations = () => (
  <>
    <SeoHead
      title={pageTitle}
      description={pageDescription}
      canonical={pageUrl}
      image={destinations[0].image}
      structuredData={[
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pageTitle,
          description: pageDescription,
          url: pageUrl,
          isPartOf: { "@type": "WebSite", name: "TripSathi", url: SITE_URL },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Destinations", item: pageUrl },
          ],
        },
      ]}
    />
    <div className="page-bg py-8 md:py-12">
      <div className="page-container">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Destinations" }]} />
        <header className="mb-10 max-w-3xl">
          <p className="section-label mb-3">Explore India</p>
          <h1 className="text-4xl font-bold md:text-5xl">Destination guides</h1>
          <p className="mt-4 text-lg leading-8 text-text-secondary">
            Start with useful context, then shape a trip around your dates,
            interests, pace, and budget. These guides are curated information;
            TripSathi generates personalised itineraries separately.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <article key={destination.slug} className="surface-card overflow-hidden">
              <Link to={DESTINATION_PATH(destination.slug)} className="group block">
                <img
                  src={destination.image}
                  alt={destination.imageAlt}
                  width="960"
                  height="600"
                  loading="lazy"
                  className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="p-5">
                  <p className="section-label">{destination.region}</p>
                  <h2 className="mt-2 text-2xl font-bold group-hover:text-accent">
                    {destination.name}
                  </h2>
                  <p className="mt-3 leading-7 text-text-secondary">
                    {destination.summary}
                  </p>
                  <span className="mt-4 inline-flex font-semibold text-accent">
                    Read the {destination.name} guide <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Destinations;
