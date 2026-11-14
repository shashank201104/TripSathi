import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { aiAPI, mapsAPI, tripAPI } from "../services/api";
import { Button, EmptyState, LoadingSpinner } from "../components/ui";
import {
  FaArrowRight,
  FaBell,
  FaBookmark,
  FaCalendarAlt,
  FaChevronRight,
  FaCog,
  FaCompass,
  FaGlobe,
  FaHotel,
  FaMap,
  FaMapMarkerAlt,
  FaPlane,
  FaPlaneDeparture,
  FaRoute,
  FaSearch,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";

const destinationIdeas = [
  {
    name: "Goa",
    region: "India · Beach escape",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Santorini",
    region: "Greece · Island days",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "New York",
    region: "United States · City break",
    image:
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Tokyo",
    region: "Japan · City & culture",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=700&q=85",
  },
];

const promptSuggestions = [
  "Plan a 5-day trip to Vietnam for couples, budget-friendly",
  "A relaxed weekend in Goa with great local food",
];

const formatDate = (value, options = { month: "short", day: "numeric" }) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString("en-IN", options);
};

const getSavedLocations = (response) =>
  response.data.data?.savedDestinations || response.data.savedDestinations || [];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getRemainingAiRequests } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [prompt, setPrompt] = useState("");

  const { data: recentTrips, isLoading: tripsLoading } = useApi(
    ["userTrips"],
    () => tripAPI.getTrips().then((res) => res.data.trips || res.data)
  );
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useApi(
    ["aiRecommendations"],
    () => aiAPI.getRecommendations().then((res) => res.data.data || res.data)
  );
  const { data: savedLocations } = useApi(
    ["savedLocations"],
    () => mapsAPI.getSavedLocations().then(getSavedLocations)
  );

  const fullName = user?.name || "Shashank Saini";
  const firstName = fullName.split(" ")[0] || "Shashank";
  const initials = fullName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const remainingAiRequests = getRemainingAiRequests();
  const nonDraftTrips = recentTrips?.filter((trip) => trip.status !== "draft") || [];
  const now = new Date();
  const upcomingTrips = nonDraftTrips.filter(
    (trip) => new Date(trip.startDate) > now
  );
  const completedTrips = nonDraftTrips.filter(
    (trip) => new Date(trip.endDate) < now
  );

  const openPlanner = (values = {}) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    navigate(`/trip-planner${query ? `?${query}` : ""}`);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!destination.trim()) {
      toast.error("Enter a destination to start planning.");
      return;
    }
    openPlanner({
      destination: destination.trim(),
      startDate,
      travelers,
    });
  };

  const handlePromptSubmit = (event) => {
    event.preventDefault();
    if (!prompt.trim()) {
      toast.error("Add a trip idea or choose a suggested prompt.");
      return;
    }
    openPlanner({ prompt: prompt.trim() });
  };

  const handleRefreshRecommendations = async () => {
    try {
      await aiAPI.refreshRecommendations();
      await refetchRecommendations();
      toast.success("New trip recommendations generated!");
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      toast.error("Failed to generate new recommendations");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FaCompass },
    { name: "Planner", href: "/trip-planner", icon: FaPlane },
    { name: "My Trips", href: "/trips", icon: FaRoute },
    { name: "Maps", href: "/maps", icon: FaMap },
    { name: "Settings", href: "/profile", icon: FaCog },
  ];

  const metrics = [
    {
      label: "Upcoming journeys",
      value: tripsLoading ? null : upcomingTrips.length,
      detail: `${completedTrips.length} trips completed`,
      icon: FaPlaneDeparture,
      tone: "text-accent bg-accent-muted",
    },
    {
      label: "AI credits",
      value: remainingAiRequests === -1 ? "∞" : remainingAiRequests,
      detail: "Ready for your next plan",
      icon: FaGlobe,
      tone: "text-accent bg-accent-muted",
    },
    {
      label: "Saved ideas",
      value: savedLocations?.length ?? 0,
      detail: "Places on your wishlist",
      icon: FaBookmark,
      tone: "text-amber-600 dark:text-amber-300 bg-amber-500/10",
    },
  ];

  const travelHubItems =
    nonDraftTrips.length > 0
      ? nonDraftTrips.slice(0, 4).map((trip, index) => {
          const tripName =
            trip.destination?.city || trip.title || `Trip ${index + 1}`;
          const isPast = new Date(trip.endDate) < now;
          return {
            name: tripName,
            region: `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`,
            image: destinationIdeas[index % destinationIdeas.length].image,
            status: isPast ? "Completed" : "Planning",
            progress: isPast ? 100 : 60,
            destination: tripName,
            href: `/trips/${trip._id || trip.id}`,
          };
        })
      : destinationIdeas.map((idea) => ({
          ...idea,
          status: "Get inspired",
          progress: 0,
          destination: idea.name,
          href: `/trip-planner?destination=${encodeURIComponent(idea.name)}`,
        }));

  const activities = [
    ...nonDraftTrips.slice(0, 3).map((trip) => ({
      id: `trip-${trip._id || trip.id}`,
      icon: FaBookmark,
      title: `Saved "${trip.destination?.city || trip.title || "Trip"}" itinerary`,
      detail: `Trip planner · ${formatDate(trip.updatedAt || trip.createdAt || trip.startDate)}`,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    })),
    ...(savedLocations || []).slice(0, 3).map((idea, index) => ({
      id: `idea-${idea._id || idea.id || index}`,
      icon: FaMapMarkerAlt,
      title: `Saved ${idea.name || idea.title || idea.address || "a destination"}`,
      detail: `Saved places · ${formatDate(idea.createdAt || idea.savedAt)}`,
      tone: "bg-accent-muted text-accent",
    })),
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-bg text-text-primary transition-theme lg:flex">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed bottom-0 left-0 right-0 top-14 z-[60] bg-slate-950/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed bottom-0 left-0 top-14 z-[70] flex w-[min(18rem,85vw)] flex-col bg-[#0F172A] px-4 py-5 text-slate-300 shadow-2xl transition-transform lg:sticky lg:top-14 lg:z-30 lg:h-[calc(100vh-3.5rem)] lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        <nav aria-label="Dashboard navigation" className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href === "/profile" && location.pathname.startsWith("/profile"));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-950/25"
                    : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <item.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {item.name}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <FaSignOutAlt aria-hidden="true" className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-primary shadow-sm lg:hidden"
              >
                <FaCompass aria-hidden="true" className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-text-primary sm:text-2xl">
                  Welcome back, {firstName}!
                </h1>
                <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                  Your next adventure awaits.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => toast("You're all caught up!")}
                aria-label="Notifications"
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary shadow-sm transition-colors hover:text-accent"
              >
                <FaBell aria-hidden="true" className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-orange-500" />
              </button>
              <Link
                to="/profile"
                aria-label={`Open ${fullName}'s profile`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-orange-200 to-orange-400 text-xs font-bold text-slate-900 shadow-sm"
              >
                {initials}
              </Link>
            </div>
          </header>

          <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(15rem,0.8fr)]">
            <div className="relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-700 bg-[#18232e] p-5 text-white shadow-md sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-75"
              >
                <svg
                  viewBox="0 0 900 380"
                  preserveAspectRatio="xMidYMid slice"
                  className="h-full w-full"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="map-wash" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#26394a" stopOpacity=".75" />
                      <stop offset="1" stopColor="#0f172a" stopOpacity=".2" />
                    </linearGradient>
                  </defs>
                  <rect width="900" height="380" fill="url(#map-wash)" />
                  <g fill="#3b4d5c" fillOpacity=".65" stroke="#91a0aa" strokeOpacity=".2">
                    <path d="m62 83 38-26 62 5 24 23-8 31-31 10-11 25-39 7-19 31-26-8-17-31-27-9-12-30 17-21 32-7z" />
                    <path d="m187 190 28 9 16 32-7 42-18 29-4 43-21 21-13-28-3-37-17-33 7-39z" />
                    <path d="m385 91 25-24 56 2 32 17 36-5 33 11 18 23-20 14-30-8-18 15-29-3-24 20-22-8-20 15-24-10-17-27-26-5-22-15z" />
                    <path d="m438 169 32-15 32 11 15 31-11 33-18 16-8 50-24 20-18-31-7-47-22-30 5-24z" />
                    <path d="m574 123 30-20 41 7 24 18 42-3 33 23-9 23-43 3-13 19-28-1-18 18-28-8-14-27-33-7-19-24z" />
                    <path d="m702 232 34-10 36 12 11 24-22 21-43-3-24-18z" />
                    <path d="m824 289 20-9 14 13-8 21-21 2-12-12z" />
                  </g>
                  <g fill="#fb923c">
                    <circle cx="141" cy="111" r="5" />
                    <circle cx="461" cy="124" r="5" />
                    <circle cx="510" cy="140" r="4" />
                    <circle cx="631" cy="163" r="5" />
                    <circle cx="746" cy="247" r="4" />
                  </g>
                  <g stroke="#fb923c" strokeOpacity=".45" strokeDasharray="4 7">
                    <path d="M141 111Q320 20 461 124T631 163Q703 204 746 247" />
                  </g>
                </svg>
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#18232e] via-[#18232e]/85 to-[#18232e]/30" />
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-100">
                  <FaGlobe aria-hidden="true" />
                  Your world, your way
                </span>
                <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Plan your trip</h2>
                <p className="mt-2 max-w-md text-xs leading-5 text-slate-300 sm:text-sm">
                  Search the world and turn your next destination into a thoughtfully planned journey.
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="mt-6 grid gap-2 rounded-2xl border border-white/15 bg-white p-2 text-slate-800 shadow-xl sm:grid-cols-[minmax(0,1.5fr)_minmax(8rem,0.8fr)_minmax(7rem,0.7fr)_auto]"
              >
                <label className="flex min-w-0 items-center gap-2 px-2.5 py-1.5">
                  <FaMapMarkerAlt aria-hidden="true" className="shrink-0 text-orange-500" />
                  <span className="sr-only">Where to?</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Where to?"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-1.5 sm:border-l sm:border-t-0">
                  <FaCalendarAlt aria-hidden="true" className="shrink-0 text-slate-400" />
                  <span className="sr-only">Start date</span>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setStartDate(event.target.value)}
                    aria-label="Start date"
                    className="w-full min-w-0 border-0 bg-transparent p-0 text-xs text-slate-600 focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-1.5 sm:border-l sm:border-t-0">
                  <FaUsers aria-hidden="true" className="shrink-0 text-slate-400" />
                  <span className="sr-only">Travelers</span>
                  <select
                    value={travelers}
                    onChange={(event) => setTravelers(event.target.value)}
                    aria-label="Travelers"
                    className="w-full min-w-0 border-0 bg-transparent p-0 text-xs text-slate-600 focus:outline-none focus:ring-0"
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "traveler" : "travelers"}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  aria-label="Search destinations"
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                >
                  <FaSearch aria-hidden="true" />
                  <span className="sm:hidden">Search</span>
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-theme sm:flex-col sm:items-start xl:flex-row xl:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.tone}`}>
                      <metric.icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
                      <p className="mt-0.5 text-xl font-bold leading-none text-text-primary">
                        {metric.value === null ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          metric.value
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="hidden rounded-full bg-surface-elevated px-2.5 py-1 text-[10px] font-medium text-text-secondary sm:inline-flex xl:hidden">
                    {metric.detail}
                  </span>
                  <FaChevronRight
                    aria-hidden="true"
                    className="h-3 w-3 text-text-secondary sm:hidden xl:block"
                  />
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="travel-hub-title" className="mb-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-accent">
                  Explore & plan
                </p>
                <h2 id="travel-hub-title" className="mt-1 text-lg font-bold text-text-primary sm:text-xl">
                  Your travel hub
                </h2>
              </div>
              <Link
                to="/trips"
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                View all <FaArrowRight aria-hidden="true" className="h-2.5 w-2.5" />
              </Link>
            </div>
            {tripsLoading ? (
              <div className="surface-card flex justify-center rounded-2xl py-10">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {travelHubItems.map((item, index) => (
                  <motion.div
                    key={`${item.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      to={item.href}
                      className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div
                        role="img"
                        aria-label={`${item.name} travel`}
                        className="relative h-28 bg-cover bg-center sm:h-36"
                        style={{ backgroundImage: `url("${item.image}")` }}
                      >
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-950/60 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
                          {item.status}
                        </span>
                        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm transition-transform group-hover:scale-105">
                          <FaArrowRight aria-hidden="true" className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="p-3 sm:p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-text-primary">
                              {item.name}
                            </h3>
                            <p className="mt-0.5 truncate text-[10px] text-text-secondary">
                              {item.region}
                            </p>
                          </div>
                          <FaMapMarkerAlt aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-accent" />
                        </div>
                        <div className="mt-3">
                          <div className="mb-1.5 flex justify-between text-[9px] font-medium text-text-secondary">
                            <span>{item.progress ? "Planning" : "Start planning"}</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div
                            className="h-1.5 overflow-hidden rounded-full bg-surface-elevated"
                            role="progressbar"
                            aria-label={`${item.name} planning progress`}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={item.progress}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.8fr)]">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-accent">
                    Your AI travel companion
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-text-primary">
                    Dream it. We’ll map it.
                  </h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    Describe the trip you have in mind to get started.
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <FaPlaneDeparture aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
              <form onSubmit={handlePromptSubmit}>
                <label htmlFor="dashboard-trip-prompt" className="sr-only">
                  Describe your ideal trip
                </label>
                <textarea
                  id="dashboard-trip-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows="3"
                  placeholder="Ask AI: “Plan a 5-day trip to Vietnam for couples, budget-friendly”"
                  className="w-full resize-y rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setPrompt(suggestion)}
                        className="rounded-full border border-border px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        {index === 0 ? "Budget-friendly" : "Food & culture"}
                      </button>
                    ))}
                  </div>
                  <Button type="submit" variant="primary" size="sm" icon={FaArrowRight}>
                    Start planning
                  </Button>
                </div>
              </form>
            </div>

            <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-accent">
                  A little inspiration
                </p>
                <h2 className="mt-1 text-lg font-bold text-text-primary">Ideas to go places</h2>
              </div>
              <div className="space-y-2.5">
                {recommendationsError ? (
                  <p className="rounded-xl bg-surface-elevated p-3 text-xs text-text-secondary">
                    Recommendations are unavailable right now.
                  </p>
                ) : recommendationsLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner />
                  </div>
                ) : recommendations?.length > 0 ? (
                  recommendations.slice(0, 2).map((idea, index) => (
                    <button
                      key={`${idea.destination}-${index}`}
                      type="button"
                      onClick={() =>
                        openPlanner({
                          destination: idea.destination,
                          prompt: idea.highlights,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg p-3 text-left transition-colors hover:border-accent/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                        <FaGlobe aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-text-primary">
                          {idea.destination}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-text-secondary">
                          {idea.highlights || "A destination picked for you"}
                        </span>
                      </span>
                      <FaChevronRight aria-hidden="true" className="h-3 w-3 shrink-0 text-text-secondary" />
                    </button>
                  ))
                ) : (
                  <Link
                    to="/maps"
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3 transition-colors hover:border-accent/40"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <FaMap aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-text-primary">
                        Curated guides
                      </span>
                      <span className="mt-0.5 block text-[10px] text-text-secondary">
                        Explore destinations on the map
                      </span>
                    </span>
                    <FaChevronRight aria-hidden="true" className="h-3 w-3 text-text-secondary" />
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                disabled={recommendationsLoading}
                className="mt-3 text-xs font-semibold text-accent hover:underline disabled:opacity-50"
              >
                {recommendationsLoading ? "Refreshing…" : "Refresh suggestions"}
              </button>
            </aside>
          </section>

          <section aria-labelledby="recent-activity-title" className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-accent">
                  A trail of good times
                </p>
                <h2 id="recent-activity-title" className="mt-1 text-lg font-bold text-text-primary">
                  Recent activity
                </h2>
              </div>
              <Link to="/trips" className="text-xs font-semibold text-accent hover:underline">
                View trips
              </Link>
            </div>
            {activities.length > 0 ? (
              <ol className="divide-y divide-border">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.tone}`}>
                      <activity.icon aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-text-primary">
                        {activity.title}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-text-secondary">
                        {activity.detail}
                      </span>
                    </span>
                    <FaChevronRight aria-hidden="true" className="h-3 w-3 text-text-secondary" />
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                icon={FaHotel}
                title="Your travel story starts here"
                description="Plan a trip or save a place to see your activity."
                className="py-5"
                action={
                  <Link to="/trip-planner" className="text-xs font-semibold text-accent hover:underline">
                    Plan your first trip <FaArrowRight aria-hidden="true" className="ml-1 inline h-2.5 w-2.5" />
                  </Link>
                }
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
