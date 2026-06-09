import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { tripAPI } from "../services/api";
import { Card, Button, LoadingSpinner, Badge, PageHeader, EmptyState } from "../components/ui";
import {
  FaRoute,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaPlus,
  FaStar,
  FaUsers,
  FaDollarSign,
  FaSearch,
} from "react-icons/fa";

const Trips = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading } = useApi(["trips"], () =>
    tripAPI.getTrips().then((res) => res.data)
  );

  const trips = response?.trips || [];

  const filteredTrips =
    trips?.filter((trip) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const destinationStr = trip.destination?.city
          ? `${trip.destination.city} ${trip.destination.country}`.toLowerCase()
          : typeof trip.destination === "string"
          ? trip.destination.toLowerCase()
          : "";
        const matchesSearch =
          destinationStr.includes(query) ||
          trip.description?.toLowerCase().includes(query) ||
          trip.title?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filter === "draft") return trip.status === "draft";
      if (filter === "all") return trip.status !== "draft";

      const now = new Date();
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);

      if (filter === "upcoming") {
        return trip.status === "upcoming" && startDate >= now;
      }
      if (filter === "past") return endDate < now;
      return true;
    }) || [];

  const getStatusVariant = (trip) => {
    if (trip.status === "draft") return "secondary";
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    if (endDate < now) return "success";
    if (startDate <= now && endDate >= now) return "warning";
    return "primary";
  };

  const getStatusLabel = (trip) => {
    if (trip.status === "draft") return "Draft";
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    if (endDate < now) return "Completed";
    if (startDate <= now && endDate >= now) return "In Progress";
    return "Upcoming";
  };

  return (
    <div className="page-bg">
      <div className="page-container relative">
        <PageHeader
          title="My Trips"
          subtitle="Manage and view all your travel plans"
          actions={
            <Link to="/trip-planner">
              <Button variant="primary" icon={FaPlus}>
                Plan New Trip
              </Button>
            </Link>
          }
        />

        <Card className="p-4 mb-6" animate={false}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-md bg-surface-elevated text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-theme"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "past", label: "Past" },
                { id: "draft", label: "Drafts" },
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-all ${
                    filter === filterOption.id
                      ? "bg-accent text-bg"
                      : "bg-surface-elevated text-text-secondary border border-border hover:border-accent/30"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip._id || trip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/trips/${trip._id || trip.id}`}>
                  <Card className="h-full p-0 overflow-hidden hover:border-accent/30 transition-all" animate={false}>
                    <div className="relative h-32 bg-surface-elevated border-b border-border">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaMapMarkedAlt className="h-12 w-12 text-accent/20" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={getStatusVariant(trip)} size="sm">
                          {getStatusLabel(trip)}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-display font-semibold text-text-primary">
                          {trip.destination?.city || trip.title || trip.destination}
                          {trip.destination?.country &&
                            trip.destination.city !== trip.destination.country &&
                            `, ${trip.destination.country}`}
                        </h3>
                        {(trip.description || trip.title) && (
                          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                            {trip.description || trip.title}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-text-secondary">
                        <FaCalendarAlt className="mr-2 text-accent" />
                        {new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        –{" "}
                        {new Date(trip.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-text-secondary">
                        <div className="flex items-center">
                          <FaUsers className="mr-1.5" />
                          {trip.preferences?.groupSize || trip.travelers || trip.groupSize || 1} travelers
                        </div>
                        {(trip.budget || trip.preferences?.budget) && (
                          <div className="flex items-center font-mono text-text-primary">
                            <FaDollarSign className="mr-0.5" />
                            {trip.preferences?.budget?.max
                              ? `₹${trip.preferences.budget.max.toLocaleString()}`
                              : trip.budget?.max
                              ? `₹${trip.budget.max.toLocaleString()}`
                              : trip.budget}
                          </div>
                        )}
                      </div>

                      {trip.rating && (
                        <div className="flex items-center">
                          <FaStar className="h-3.5 w-3.5 text-warning mr-1" />
                          <span className="text-sm font-medium text-text-primary">{trip.rating}</span>
                          <span className="text-xs text-text-secondary ml-1">/ 5.0</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={FaRoute}
              title={searchQuery || filter !== "all" ? "No trips found" : "No trips yet"}
              description={
                searchQuery || filter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Start planning your first adventure with AI assistance"
              }
              action={
                !searchQuery &&
                filter === "all" && (
                  <Link to="/trip-planner">
                    <Button variant="primary" icon={FaPlus}>
                      Plan Your First Trip
                    </Button>
                  </Link>
                )
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Trips;
