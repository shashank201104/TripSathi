import { Link } from "react-router-dom";
import SeoHead from "../components/seo/SeoHead";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import { SITE_URL } from "../data/site";

const About = () => {
  const canonical = `${SITE_URL}/about/`;
  const title = "About TripSathi | AI-Assisted Travel Planning";
  const description =
    "Learn how TripSathi combines destination research, editable travel plans, and AI-assisted itinerary ideas to help travellers prepare.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical={canonical}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: title,
          description,
          url: canonical,
          about: { "@type": "Organization", name: "TripSathi", url: SITE_URL },
        }}
      />
      <main className="page-bg py-8 md:py-12">
        <div className="page-container max-w-4xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About TripSathi" }]} />
          <p className="section-label mb-3">About the project</p>
          <h1 className="text-4xl font-bold md:text-5xl">Travel planning, made personal</h1>
          <p className="mt-5 text-lg leading-8 text-text-secondary">
            TripSathi is a travel-planning application that helps people organise
            destination research and build editable itinerary drafts around their
            own preferences. Its public guides provide curated starting points;
            its AI planner generates suggestions when a signed-in user requests
            an itinerary.
          </p>

          <section className="mt-10 space-y-5">
            <h2 className="text-2xl font-bold">How TripSathi works</h2>
            <p className="leading-8 text-text-secondary">
              Travellers can read destination guides without an account. To use
              the personalised planner, they provide trip details such as a
              destination, dates, group size, budget, and interests. The
              application sends the planning request to its AI service and lets
              the signed-in traveller review and save a trip.
            </p>
            <p className="leading-8 text-text-secondary">
              Map features use OpenStreetMap-based services for place discovery
              and location tasks. Availability and accuracy depend on the
              underlying providers and current local data. TripSathi is a
              planning tool, not a booking service or a substitute for official
              travel, safety, medical, or entry advice.
            </p>
            <p className="leading-8 text-text-secondary">
              AI-generated details can be incomplete or out of date. Confirm
              opening hours, access rules, routes, prices, permits, and other
              time-sensitive information with current authoritative sources
              before making decisions.
            </p>
          </section>

          <section className="mt-10 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-2xl font-bold">Explore TripSathi</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/destinations/" className="btn-outline">Destination guides</Link>
              <Link to="/blog/" className="btn-outline">Travel articles</Link>
              <Link to="/contact/" className="btn-outline">Contact</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default About;
