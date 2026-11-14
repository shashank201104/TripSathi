import { Link, useSearchParams } from "react-router-dom";
import SeoHead from "../components/seo/SeoHead";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import articles from "../data/articles.json";
import destinations from "../data/destinations.json";
import { ARTICLE_PATH, SITE_URL, findDestination } from "../data/site";

const pageUrl = `${SITE_URL}/blog/`;
const pageTitle = "Travel Guides & Trip Planning Articles | TripSathi";
const pageDescription =
  "Read practical travel guides for Jaipur, Ladakh, and Kerala, including flexible itinerary ideas, seasonal planning, and destination tips.";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const categories = ["All", ...new Set(articles.map((article) => article.category))];
  const visibleArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  const setCategory = (category) => {
    setSearchParams(category === "All" ? {} : { category });
  };

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonical={pageUrl}
        image={destinations[0].image}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "TripSathi Travel Guides",
          description: pageDescription,
          url: pageUrl,
          publisher: { "@type": "Organization", name: "TripSathi", url: SITE_URL },
        }}
      />
      <main className="page-bg py-8 md:py-12">
        <div className="page-container">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Travel guides" }]} />
          <header className="mb-8 max-w-3xl">
            <p className="section-label mb-3">TripSathi journal</p>
            <h1 className="text-4xl font-bold md:text-5xl">
              Travel guides for more thoughtful trips
            </h1>
            <p className="mt-4 text-lg leading-8 text-text-secondary">
              Practical destination notes and flexible planning ideas. Travel
              conditions, access, and prices can change, so confirm current details
              before you go.
            </p>
          </header>

          <div className="mb-7 flex flex-wrap gap-2" aria-label="Filter articles by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => setCategory(category)}
                className={
                  selectedCategory === category
                    ? "btn-primary btn-sm"
                    : "btn-outline btn-sm"
                }
              >
                {category}
              </button>
            ))}
          </div>

          <section aria-label="Travel articles" className="grid gap-5 md:grid-cols-2">
            {visibleArticles.map((article) => {
              const destination = findDestination(article.destinationSlug);
              const words = article.sections
                .flatMap((section) => section.paragraphs)
                .join(" ")
                .split(/\s+/).length;
              const readingMinutes = Math.max(1, Math.ceil(words / 220));

              return (
                <article key={article.slug} className="surface-card overflow-hidden">
                  <Link to={ARTICLE_PATH(article.slug)} className="group block">
                    <img
                      src={destination.image}
                      alt={`${destination.name} landscape`}
                      width="960"
                      height="540"
                      loading="lazy"
                      className="h-52 w-full object-cover"
                    />
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                        <span className="font-semibold text-accent">{article.category}</span>
                        <time dateTime={article.publishedAt}>
                          {new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" }
                          )}
                        </time>
                        <span>{readingMinutes} min read</span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold group-hover:text-accent">
                        {article.title}
                      </h2>
                      <p className="mt-3 leading-7 text-text-secondary">
                        {article.description}
                      </p>
                      <span className="mt-4 inline-flex font-semibold text-accent">
                        Read article <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>

          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-2xl font-bold">Browse destination guides</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {destinations.map((destination) => (
                <Link
                  key={destination.slug}
                  to={`/destinations/${destination.slug}/`}
                  className="btn-outline"
                >
                  {destination.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Blog;
