const express = require("express");
const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const {
  generateItinerary,
  optimizeItinerary,
  getTravelSuggestions,
  getDestinationInsights,
  getRecommendations,
} = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation middleware for itinerary generation
const generateItineraryValidation = [
  body("destination")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Destination must be between 2 and 100 characters"),
  body("duration")
    .isInt({ min: 1, max: 30 })
    .withMessage("Duration must be between 1 and 30 days"),
  body("budget.min")
    .optional()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("Minimum budget must be a valid non-negative number"),
  body("budget.max")
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("Maximum budget must be a valid non-negative number"),
  body("groupSize")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Group size must be between 1 and 20"),
  body("budget.currency").optional().isIn(["INR", "USD", "EUR"]),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  validate,
];

const optimizeItineraryValidation = [
  body("itinerary").isObject(),
  body("optimizationGoals")
    .optional()
    .isArray({ max: 10 })
    .custom((goals) => goals.every((goal) =>
      ["cost", "time", "experience"].includes(goal))),
  validate,
];

const travelSuggestionsValidation = [
  body("preferences").optional().isObject(),
  body("currentLocation").optional().isString().isLength({ max: 160 }),
  body("travelHistory").optional().isArray({ max: 50 }),
  validate,
];

const destinationInsightsValidation = [
  body("destination").isString().trim().isLength({ min: 2, max: 100 }),
  body("travelDates").optional().isString().isLength({ max: 100 }),
  validate,
];

// @route   POST /api/ai/generate-itinerary
// @desc    Generate AI-powered trip itinerary
// @access  Private
router.post(
  "/generate-itinerary",
  protect,
  generateItineraryValidation,
  generateItinerary
);

// @route   POST /api/ai/optimize-itinerary
// @desc    Optimize existing itinerary
// @access  Private
router.post("/optimize-itinerary", protect, optimizeItineraryValidation, optimizeItinerary);

// @route   POST /api/ai/travel-suggestions
// @desc    Get AI-powered travel suggestions
// @access  Private
router.post("/travel-suggestions", protect, travelSuggestionsValidation, getTravelSuggestions);

// @route   POST /api/ai/destination-insights
// @desc    Get destination insights and information
// @access  Private
router.post("/destination-insights", protect, destinationInsightsValidation, getDestinationInsights);

// @route   GET /api/ai/recommendations
// @desc    Get AI-powered trip recommendations
// @access  Private
router.get("/recommendations", protect, getRecommendations);

// @route   POST /api/ai/recommendations/refresh
// @desc    Refresh AI-powered trip recommendations (clears cache)
// @access  Private
router.post("/recommendations/refresh", protect, getRecommendations);

module.exports = router;
