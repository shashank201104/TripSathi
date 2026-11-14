import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import SeoHead from "../components/seo/SeoHead";
import { ARTICLE_PATH, DESTINATION_PATH, SITE_URL, findArticle, findDestination, getRelatedArticles } from "../data/site";

const BlogPost = () => {
  const { slug } = useParams();
  const article = findArticle(slug);
  const destination = article && findDestination(article.destinationSlug);

  if (!article || !destination) {
    return (
      <main className="page-bg py-12">
        <div className="page-container">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <Link className="mt-4 inline-flex text-accent underline" to="/blog/">
            Browse travel guides
          </Link>
        </div>
      </main>
    );
  }

  const canonical = `${SITE_URL}${ARTICLE_PATH(article.slug)}`;
  const relatedArticles = getRelatedArticles(article);
  const wordCount = article.sections
    .flatMap((section) => section.paragraphs)
    .join(" ")
    .split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const description = article.description;

  return (
    <>
      <SeoHead
        title={`${article.title} | TripSathi`}
        description={description}
        canonical={canonical}
        image={destination.image}
        preloadImage
        type="article"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description,
            image: [destination.image],
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: { "@type": "Organization", name: article.author },
            publisher: { "@type": "Organization", name: "TripSathi", url: SITE_URL },
            mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
            articleSection: article.category,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Travel guides", item: `${SITE_URL}/blog/` },
              { "@type": "ListItem", position: 3, name: article.title, item: canonical },
            ],
          },
        ]}
      />
      <main className="page-bg py-8 md:py-12">
        <article className="page-container max-w-5xl">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Travel guides", to: "/blog/" },
              { label: article.title },
            ]}
          />
          <header className="mb-8">
            <p className="section-label mb-3">{article.category}</p>
            <h1 className="max-w-4xl text-4xl font-bold md:text-5xl">{article.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-text-secondary">
              {article.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span>By {article.author}</span>
              <span>
                Published{" "}
                <time dateTime={article.publishedAt}>
                  {new Date(`${article.publishedAt}T00:00:00`).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </time>
              </span>
              {article.updatedAt !== article.publishedAt && (
                <span>
                  Updated{" "}
                  <time dateTime={article.updatedAt}>
                    {new Date(`${article.updatedAt}T00:00:00`).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </time>
                </span>
              )}
              <span>{readingMinutes} min read</span>
            </div>
          </header>

          <figure className="mb-10 overflow-hidden rounded-xl">
            <img
              src={destination.image}
              alt={`${destination.name}: ${destination.imageAlt}`}
              width="1400"
              height="800"
              loading="eager"
              className="max-h-[520px] w-full object-cover"
            />
            <figcaption className="mt-2 text-sm text-text-secondary">
              {destination.name}, {destination.region}
            </figcaption>
          </figure>

          <div className="max-w-3xl space-y-8">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold md:text-3xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-text-secondary">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <aside className="surface-card-elevated mt-10 rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold">Plan your {destination.name} trip</h2>
            <p className="mt-3 max-w-2xl leading-7 text-text-secondary">
              Create a personalised itinerary draft around your own dates,
              preferences, group size, and budget. Review generated details
              independently before booking.
            </p>
            <Link
              to={`/plan?destination=${encodeURIComponent(destination.name)}`}
              className="btn-primary mt-5"
            >
              Generate my itinerary
            </Link>
          </aside>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-2xl font-bold">
              Explore the {destination.name} destination guide
            </h2>
            <Link
              to={DESTINATION_PATH(destination.slug)}
              className="mt-3 inline-flex font-semibold text-accent hover:underline"
            >
              {destination.name}: attractions, travel tips, and planning
            </Link>
          </section>

          {relatedArticles.length > 0 && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-2xl font-bold">Related articles</h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {relatedArticles.map((related) => (
                  <li key={related.slug} className="surface-card p-5">
                    <Link
                      to={ARTICLE_PATH(related.slug)}
                      className="font-bold text-accent hover:underline"
                    >
                      {related.title}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {related.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
    </>
  );
};

export default BlogPost;
