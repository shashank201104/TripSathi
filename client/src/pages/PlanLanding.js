import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/seo/Breadcrumbs";
import SeoHead from "../components/seo/SeoHead";
import { useAuth } from "../contexts/AuthContext";
import { SITE_URL } from "../data/site";

const PENDING_TRIP_KEY = "tripsathi-pending-itinerary";
const budgetOptions = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
];
const formatDateInput = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const PlanLanding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const today = formatDateInput(new Date());
  const [values, setValues] = useState({
    destination: searchParams.get("destination") || "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "mid-range",
    interests: "",
    travelStyle: "mid-range",
    accommodationType: "hotel",
    transportation: "flight",
    specialRequests: "",
  });
  const canonical = `${SITE_URL}/plan/`;
  const title = "Start a Personalised Trip Plan | TripSathi";
  const description =
    "Tell TripSathi where and how you want to travel. Save your trip preferences and continue to the AI itinerary planner.";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const saveDraft = () => {
    const savedValues = {
      ...values,
      travelers: Number(values.travelers),
      interests: values.interests
        .split(",")
        .map((interest) => interest.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8),
    };

    try {
      sessionStorage.setItem(
        PENDING_TRIP_KEY,
        JSON.stringify({ savedAt: Date.now(), values: savedValues })
      );
    } catch (storageError) {
      console.error("Could not temporarily save trip preferences:", storageError);
      setError("Your browser could not save this trip draft. Check storage settings and try again.");
      return false;
    }
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (new Date(values.endDate) < new Date(values.startDate)) {
      setError("The return date must be on or after the start date.");
      return;
    }
    if (Number(values.travelers) < 1 || Number(values.travelers) > 20) {
      setError("Choose between 1 and 20 travellers.");
      return;
    }
    if (!saveDraft()) return;

    if (isAuthenticated) {
      navigate("/trip-planner?restore=1");
    } else {
      navigate("/login", {
        state: { from: { pathname: "/trip-planner", search: "?restore=1" } },
      });
    }
  };

  return (
    <>
      <SeoHead title={title} description={description} canonical={canonical} />
      <main className="page-bg py-8 md:py-12">
        <div className="page-container max-w-4xl">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Plan a trip" }]} />
          <header className="mb-8 max-w-3xl">
            <p className="section-label mb-3">Your trip, your way</p>
            <h1 className="text-4xl font-bold md:text-5xl">Start your itinerary</h1>
            <p className="mt-4 leading-7 text-text-secondary">
              Add your trip details before signing in. We will keep this draft
              in this browser session and restore it in the planner after you
              authenticate. Do not include sensitive personal information.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="surface-card space-y-6 p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="plan-destination" className="mb-2 block text-sm font-semibold">
                  Destination
                </label>
                <input
                  id="plan-destination"
                  name="destination"
                  required
                  minLength={3}
                  maxLength={120}
                  value={values.destination}
                  onChange={handleChange}
                  className="input"
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="plan-start" className="mb-2 block text-sm font-semibold">
                  Start date
                </label>
                <input
                  id="plan-start"
                  name="startDate"
                  type="date"
                  required
                  min={today}
                  value={values.startDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="plan-end" className="mb-2 block text-sm font-semibold">
                  End date
                </label>
                <input
                  id="plan-end"
                  name="endDate"
                  type="date"
                  required
                  min={values.startDate || today}
                  value={values.endDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="plan-travelers" className="mb-2 block text-sm font-semibold">
                  Travellers
                </label>
                <input
                  id="plan-travelers"
                  name="travelers"
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={values.travelers}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="plan-budget" className="mb-2 block text-sm font-semibold">
                  Budget style
                </label>
                <select
                  id="plan-budget"
                  name="budget"
                  value={values.budget}
                  onChange={handleChange}
                  className="input"
                >
                  {budgetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="plan-style" className="mb-2 block text-sm font-semibold">
                  Travel style
                </label>
                <select
                  id="plan-style"
                  name="travelStyle"
                  value={values.travelStyle}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label htmlFor="plan-interests" className="mb-2 block text-sm font-semibold">
                  Interests <span className="font-normal text-text-secondary">(optional, comma-separated)</span>
                </label>
                <input
                  id="plan-interests"
                  name="interests"
                  maxLength={200}
                  value={values.interests}
                  onChange={handleChange}
                  className="input"
                  placeholder="food, history, nature"
                />
              </div>
              <div>
                <label htmlFor="plan-stay" className="mb-2 block text-sm font-semibold">
                  Accommodation
                </label>
                <select
                  id="plan-stay"
                  name="accommodationType"
                  value={values.accommodationType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="airbnb">Vacation rental</option>
                  <option value="hostel">Hostel</option>
                  <option value="boutique">Boutique hotel</option>
                </select>
              </div>
              <div>
                <label htmlFor="plan-transport" className="mb-2 block text-sm font-semibold">
                  Preferred transport
                </label>
                <select
                  id="plan-transport"
                  name="transportation"
                  value={values.transportation}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                  <option value="mixed">Mixed options</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="plan-notes" className="mb-2 block text-sm font-semibold">
                  Additional preferences <span className="font-normal text-text-secondary">(optional)</span>
                </label>
                <textarea
                  id="plan-notes"
                  name="specialRequests"
                  rows={4}
                  maxLength={1000}
                  value={values.specialRequests}
                  onChange={handleChange}
                  className="input resize-y"
                  placeholder="Share trip preferences, not private or sensitive information."
                />
              </div>
            </div>
            {error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}
            <button type="submit" className="btn-primary">
              Continue to secure planner
            </button>
            {!isAuthenticated && (
              <p className="text-sm text-text-secondary">
                Continue to securely sign in or create an account before
                generating your itinerary. Your entered details will be
                restored after authentication.
              </p>
            )}
          </form>
        </div>
      </main>
    </>
  );
};

export default PlanLanding;
