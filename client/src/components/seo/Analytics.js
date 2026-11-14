import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
const consentKey = "tripsathi-analytics-consent";

export const setAnalyticsConsent = (value) => {
  localStorage.setItem(consentKey, value);
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: value === "granted" ? "granted" : "denied",
    });
  }
  window.dispatchEvent(new Event("tripsathi-analytics-consent-change"));
};

const initializeAnalytics = () => {
  if (!measurementId || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId
  )}`;
  document.head.appendChild(script);
};

export const trackEvent = (name, parameters = {}) => {
  if (
    !measurementId ||
    localStorage.getItem(consentKey) !== "granted" ||
    !name
  ) {
    return;
  }
  initializeAnalytics();
  window.gtag("event", name, parameters);
};

const AnalyticsManager = () => {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState(() => localStorage.getItem(consentKey));

  useEffect(() => {
    const refreshConsent = () => setConsent(localStorage.getItem(consentKey));
    window.addEventListener("tripsathi-analytics-consent-change", refreshConsent);
    return () =>
      window.removeEventListener(
        "tripsathi-analytics-consent-change",
        refreshConsent
      );
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !measurementId) return;
    initializeAnalytics();
    window.gtag("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
    });
  }, [consent, pathname]);

  const chooseConsent = (value) => {
    setAnalyticsConsent(value);
  };

  return (
    measurementId &&
    !consent && (
      <aside
        aria-label="Analytics preferences"
        className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-strong sm:inset-x-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-text-secondary">
            TripSathi can use Google Analytics to understand site visits. No
            analytics is loaded unless you allow it. Read our{" "}
            <Link to="/privacy" className="font-semibold text-accent underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => chooseConsent("denied")}
              className="btn-outline btn-sm"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => chooseConsent("granted")}
              className="btn-primary btn-sm"
            >
              Allow analytics
            </button>
          </div>
        </div>
      </aside>
    )
  );
};

export default AnalyticsManager;
