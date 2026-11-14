import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import SeoHead from "../components/seo/SeoHead";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import {
  ARTICLE_PATH,
  DESTINATION_PATH,
  SITE_URL,
  findDestination,
  getArticlesForDestination,
  getRelatedDestinations,
} from "../data/site";
import { trackEvent } from "../components/seo/Analytics";

const DestinationGuide = () => {
  const { slug } = useParams();
  const destination = findDestination(slug);
  const articles = destination ? getArticlesForDestination(destination.slug) : [];

  useEffect(() => {
    if (destination) {
      document.title = `${destination.name} Travel Guide | TripSathi`;
    }
  }, [destination]);

  if (!destination) {
    return (
      <div className="page-bg py-12">
        <div className="page-container">
          <h1 className="text-3xl font-bold">Destination guide not found</h1>
          <Link className="mt-4 inline-flex text-accent underline" to="/destinations/">
            Browse destination guides
          </Link>
        </div>
      </div>
    );
  }

  const canonical = `${SITE_URL}${DESTINATION_PATH(destination.slug)}`;
  const title = `${destination.name} Travel Guide: Places, Tips & Planning | TripSathi`;
  const description = `Plan a trip to ${destination.name}, ${destination.region}. Explore attractions, seasons, transport, local experiences, practical tips, and clearly labelled budget estimates.`;
  const relatedDestinations = getRelatedDestinations(destination);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: destination.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: `${SITE_URL}/destinations/`,
      },
      { "@type": "ListItem", position: 3, name: destination.name, item: canonical },
    ],
  };

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical={canonical}
        image={destination.image}
        preloadImage
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: title,
            description,
            url: canonical,
            isPartOf: { "@type": "WebSite", name: "TripSathi", url: SITE_URL },
            about: { "@type": "Place", name: destination.name, address: destination.region },
          },
          breadcrumbSchema,
          faqSchema,
        ]}
      />
      <div className="page-bg">
        <header className="relative min-h-[360px] overflow-hidden bg-surface-elevated md:min-h-[480px]">
          <img
            src={destination.image}
            alt={destination.imageAlt}
            width="1400"
            height="800"
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          <div className="page-container relative flex min-h-[360px] flex-col justify-end pb-10 text-white md:min-h-[480px] md:pb-14">
            <Breadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Destinations", to: "/destinations/" },
                { label: destination.name },
              ]}
            />
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              {destination.region}
            </p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">
              {destination.name} travel guide
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
              {destination.intro}
            </p>
            <Link
              to={`/plan?destination=${encodeURIComponent(destination.name)}`}
              onClick={() =>
                trackEvent("generate_itinerary_click", {
                  destination_slug: destination.slug,
                })
              }
              className="btn-primary mt-6 w-fit"
            >
              Generate my itinerary
            </Link>
          </div>
        </header>

        <main className="page-container space-y-12 py-10 md:py-14">
          <section aria-labelledby="overview-heading" className="max-w-4xl">
            <p className="section-label mb-2">Know before you go</p>
            <h2 id="overview-heading" className="text-3xl font-bold">
              About {destination.name}
            </h2>
            {destination.overview.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-8 text-text-secondary">
                {paragraph}
              </p>
            ))}
          </section>

          <section aria-labelledby="attractions-heading">
            <h2 id="attractions-heading" className="text-3xl font-bold">
              Places to visit in {destination.name}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {destination.attractions.map((place) => (
                <article key={place.name} className="surface-card p-5">
                  <h3 className="text-xl font-bold">{place.name}</h3>
                  <p className="mt-2 leading-7 text-text-secondary">
                    {place.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="surface-card p-6">
              <h2 className="text-2xl font-bold">Best time to visit</h2>
              <p className="mt-3 leading-7 text-text-secondary">{destination.bestTime}</p>
              <h3 className="mt-6 text-lg font-bold">Suggested duration</h3>
              <p className="mt-2 leading-7 text-text-secondary">{destination.duration}</p>
            </article>
            <article className="surface-card p-6">
              <h2 className="text-2xl font-bold">Estimated trip budget</h2>
              <p className="mt-2 text-sm text-text-secondary">{destination.budget.label}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-sm text-text-secondary">Economy style</dt>
                  <dd className="font-semibold">{destination.budget.economy}</dd>
                </div>
                <div>
                  <dt className="text-sm text-text-secondary">Comfort style</dt>
                  <dd className="font-semibold">{destination.budget.comfort}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{destination.budget.note}</p>
            </article>
            <article className="surface-card p-6">
              <h2 className="text-2xl font-bold">Where to stay</h2>
              <p className="mt-3 leading-7 text-text-secondary">{destination.stay}</p>
            </article>
            <article className="surface-card p-6">
              <h2 className="text-2xl font-bold">Getting around</h2>
              <p className="mt-3 leading-7 text-text-secondary">{destination.transport}</p>
            </article>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">Local experiences</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-text-secondary">
                {destination.experiences.map((experience) => (
                  <li key={experience}>{experience}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Practical travel tips</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-text-secondary">
                {destination.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-3xl font-bold">
              {destination.name} travel FAQs
            </h2>
            <div className="mt-5 space-y-4">
              {destination.faqs.map((faq) => (
                <details key={faq.question} className="surface-card p-5">
                  <summary className="cursor-pointer font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 leading-7 text-text-secondary">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {articles.length > 0 && (
            <section aria-labelledby="articles-heading">
              <h2 id="articles-heading" className="text-3xl font-bold">
                More {destination.name} travel articles
              </h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {articles.map((article) => (
                  <li key={article.slug} className="surface-card p-5">
                    <Link
                      to={ARTICLE_PATH(article.slug)}
                      className="text-lg font-bold text-accent hover:underline"
                    >
                      {article.title}
                    </Link>
                    <p className="mt-2 leading-7 text-text-secondary">
                      {article.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold">
              Related destination guides
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedDestinations.map((related) => (
                <Link
                  key={related.slug}
                  to={DESTINATION_PATH(related.slug)}
                  className="btn-outline"
                >
                  {related.name} travel guide
                </Link>
              ))}
              <Link to="/destinations/" className="btn-outline">
                All destinations
              </Link>
            </div>
          </section>

          <section className="surface-card-elevated rounded-xl p-6 text-center md:p-10">
            <h2 className="text-2xl font-bold">Make the trip your own</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-text-secondary">
              Use your dates, travel style, interests, and budget to create a
              personalised itinerary draft. Check current travel details before booking.
            </p>
            <Link
              to={`/plan?destination=${encodeURIComponent(destination.name)}`}
              onClick={() =>
                trackEvent("generate_itinerary_click", {
                  destination_slug: destination.slug,
                })
              }
              className="btn-primary mt-5"
            >
              Plan a {destination.name} trip
            </Link>
          </section>
        </main>
      </div>
    </>
  );
};

export default DestinationGuide;
