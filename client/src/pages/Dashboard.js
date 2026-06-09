import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { tripAPI, aiAPI } from "../services/api";
import { Card, Button, LoadingSpinner, Badge, PageHeader, EmptyState } from "../components/ui";
import {
  FaPlane,
  FaMapMarkedAlt,
  FaRoute,
  FaCalendarAlt,
  FaRocket,
  FaGlobe,
  FaArrowRight,
  FaPlus,
  FaStar,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getRemainingAiRequests } = useAuth();
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

  const remainingAiRequests = getRemainingAiRequests();

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

  const nonDraftTrips =
    recentTrips?.filter((trip) => trip.status !== "draft") || [];

  const quickActions = [
    {
      title: "Plan New Trip",
      description: "AI-powered itinerary",
      icon: FaPlane,
      href: "/trip-planner",
    },
    {
      title: "Explore Maps",
      description: "Discover destinations",
      icon: FaMapMarkedAlt,
      href: "/maps",
    },
  ];

  const upcomingTrips =
    nonDraftTrips?.filter((trip) => new Date(trip.startDate) > new Date()).length || 0;

  const completedTrips =
    nonDraftTrips?.filter((trip) => new Date(trip.endDate) < new Date()).length || 0;

  const statsCards = [
    { title: "Total Trips", value: nonDraftTrips?.length || 0, icon: FaRoute, label: "All time" },
    { title: "Upcoming", value: upcomingTrips, icon: FaCalendarAlt, label: "Planned" },
    { title: "Completed", value: completedTrips, icon: FaStar, label: "Past" },
    {
      title: "AI Requests",
      value: remainingAiRequests === -1 ? "∞" : remainingAiRequests,
      icon: FaRocket,
      label: "Monthly",
    },
  ];

  return (
    <div className="page-bg">
      <div className="page-container relative">
        <PageHeader
          title={`Welcome, ${user?.name?.split(" ")[0] || "Traveler"}`}
          subtitle="Your travel command center"
          badge={<Badge variant="secondary">Standard Plan</Badge>}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 md:p-5" animate={false}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="section-label mb-2">{stat.title}</p>
                    <div className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                      {tripsLoading && stat.title !== "AI Requests" ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <span className="text-xs font-mono text-text-secondary mt-1 inline-block">
                      {stat.label}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-accent-muted hidden sm:flex">
                    <stat.icon className="h-4 w-4 text-accent" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FaRocket className="text-accent h-4 w-4" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-surface-elevated hover:border-accent/30 hover:bg-accent-muted/30 transition-all"
                  >
                    <div className="p-2.5 rounded-lg bg-accent-muted border border-accent/20">
                      <action.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary">{action.title}</h3>
                      <p className="text-xs text-text-secondary">{action.description}</p>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-text-secondary group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-5 md:p-6 h-full flex flex-col">
              <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
                AI Recommended
              </h2>

              <div className="space-y-3 flex-1">
                {recommendationsError ? (
                  <EmptyState
                    icon={FaRocket}
                    title="No recommendations"
                    description={
                      recommendationsError.message?.includes("401")
                        ? "Log in to see recommendations"
                        : "Unable to load recommendations"
                    }
                    className="py-6"
                  />
                ) : recommendationsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="text-xs text-text-secondary mt-3 font-mono">Generating...</p>
                  </div>
                ) : recommendations?.length > 0 ? (
                  recommendations.slice(0, 3).map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-elevated"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                        <FaGlobe className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-text-primary truncate">
                          {rec.destination}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                          {rec.highlights}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" size="sm">
                            ₹{rec.estimatedCost?.min?.toLocaleString()}
                          </Badge>
                          <Badge variant="secondary" size="sm">
                            {rec.duration} days
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={FaRocket} title="No recommendations yet" className="py-6" />
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={handleRefreshRecommendations}
                disabled={recommendationsLoading}
              >
                {recommendationsLoading ? "Generating..." : "Refresh"}
              </Button>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                <FaRoute className="text-accent h-4 w-4" />
                My Trips
              </h2>
              <Link
                to="/trips"
                className="text-sm text-accent hover:underline flex items-center gap-1 font-medium"
              >
                View all <FaArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {tripsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : nonDraftTrips?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonDraftTrips.slice(0, 3).map((trip, index) => (
                  <motion.div
                    key={trip._id || trip.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    className="p-4 rounded-lg border border-border bg-surface-elevated hover:border-accent/30 cursor-pointer transition-all group"
                    onClick={() => navigate(`/trips/${trip._id || trip.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-text-primary capitalize truncate pr-2">
                        {trip.destination?.city || trip.title || "Unknown"}
                      </h3>
                      <Badge
                        variant={new Date(trip.endDate) < new Date() ? "success" : "warning"}
                        size="sm"
                      >
                        {new Date(trip.endDate) < new Date() ? "Done" : "Upcoming"}
                      </Badge>
                    </div>

                    <p className="text-xs font-mono text-text-secondary mb-3">
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border">
                      <span>
                        ₹
                        {(
                          trip.preferences?.budget?.max ||
                          trip.itinerary?.totalCost?.amount ||
                          trip.totalCost ||
                          0
                        ).toLocaleString("en-IN")}
                      </span>
                      <span>
                        {trip.itinerary?.days?.reduce(
                          (total, day) => total + (day.activities?.length || 0),
                          0
                        ) || 0}{" "}
                        activities
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FaPlane}
                title="No trips yet"
                description="Start planning your first adventure with AI assistance"
                action={
                  <Link to="/trip-planner">
                    <Button variant="primary" icon={FaPlus}>
                      Plan Your First Trip
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
