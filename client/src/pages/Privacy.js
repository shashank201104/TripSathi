import Breadcrumbs from "../components/seo/Breadcrumbs";
import SeoHead from "../components/seo/SeoHead";
import { setAnalyticsConsent } from "../components/seo/Analytics";
import { SITE_URL } from "../data/site";

const Privacy = () => {
  const canonical = `${SITE_URL}/privacy/`;
  const title = "Privacy Policy | TripSathi";
  const description =
    "Learn what information TripSathi processes for accounts, saved trips, AI itinerary generation, maps, contact requests, and optional analytics.";

  return (
    <>
      <SeoHead title={title} description={description} canonical={canonical} />
      <main className="page-bg py-8 md:py-12">
        <article className="page-container max-w-4xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy policy" }]} />
          <p className="section-label mb-3">Privacy</p>
          <h1 className="text-4xl font-bold md:text-5xl">TripSathi Privacy Policy</h1>
          <p className="mt-4 text-sm text-text-secondary">
            Effective date: November 15, 2026
          </p>
          <div className="mt-8 rounded-lg border border-warning/40 bg-warning-muted p-4 text-sm leading-6">
            This policy describes the data flows implemented in TripSathi's
            application code. The operator should review it against the actual
            hosting, email, analytics, provider, retention, and legal
            arrangements before launch.
          </div>

          <div className="mt-8 space-y-8 leading-8 text-text-secondary">
            <section>
              <h2 className="text-2xl font-bold text-text-primary">Information you provide</h2>
              <p className="mt-3">
                Account registration collects a name, email address, and
                password; profile fields may include optional contact and
                preference information. TripSathi stores user-created trip
                details, itinerary content, destination preferences, and saved
                locations in its application database. Passwords are processed
                by the server and stored as password hashes, not as the
                submitted plaintext password.
              </p>
              <p className="mt-3">
                The contact form sends the name, email address, and message to
                the server for email delivery. Do not submit passwords, payment
                information, or other sensitive data through it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">Authentication and local storage</h2>
              <p className="mt-3">
                The current web client stores its access JWT in browser
                localStorage and sends it to the API in an Authorization
                header. The server also issues a refresh-token cookie marked
                HttpOnly; its Secure and SameSite settings depend on the
                server's production environment. Local storage is accessible
                to scripts running in the page, so keep your device and
                browser secure and sign out on shared devices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">AI itinerary generation</h2>
              <p className="mt-3">
                When a signed-in user requests an itinerary, TripSathi sends
                the submitted travel-planning details to Google's Gemini API
                through the backend. This can include destination, dates,
                budget, group size, interests, and special requests. Avoid
                putting personal or sensitive information in free-text trip
                requests. Google's processing and retention are also subject
                to the applicable Google service terms and settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">Maps and location services</h2>
              <p className="mt-3">
                Map functions can send search text, destination addresses, or
                coordinates to the server and third-party map/geocoding
                providers used by TripSathi, including OpenStreetMap-related
                services, Nominatim, Overpass, and OSRM. If you grant browser
                location permission, the client can use your device's
                coordinates to find nearby places. Provider availability and
                their own privacy practices are outside TripSathi's control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">Optional analytics</h2>
              <p className="mt-3">
                If a Google Analytics measurement ID is configured for the
                deployed frontend, analytics is loaded only after you choose
                “Allow analytics.” TripSathi sends page paths and limited
                product events, not account names, email addresses, trip
                descriptions, or itinerary details. You can decline analytics
                using the preference banner; the current site stores that
                choice in localStorage.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setAnalyticsConsent("denied")}
                >
                  Disable analytics
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setAnalyticsConsent("granted")}
                >
                  Allow analytics
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">Retention and deletion</h2>
              <p className="mt-3">
                The application provides controls to manage trips and saved
                information, but its source does not define a universal
                retention period or a self-service account deletion process.
                Ask the TripSathi operator through the contact form about
                access or deletion requests. Requests can be handled only when
                the contact-delivery service is configured.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary">Changes and contact</h2>
              <p className="mt-3">
                This explanation should be updated if TripSathi changes its
                providers, data practices, or deployment configuration. For
                privacy questions, use the{" "}
                <a href="/contact/" className="font-semibold text-accent underline">
                  Contact page
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  );
};

export default Privacy;
