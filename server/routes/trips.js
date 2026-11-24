const express = require("express");
const { body } = require("express-validator");
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicTrips,
  cloneTrip,
  getTripStats,
} = require("../controllers/tripController");
const { protect, optionalAuth } = require("../middleware/auth");
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
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

const router = express.Router();

// Validation middleware
const tripValidation = [
  body("title")
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("destination.city")
    .notEmpty()
    .trim()
    .withMessage("Destination city is required"),
  body("destination.country")
    .notEmpty()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Destination country is required"),
  body("preferences.duration")
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),
  body("preferences.budget.max")
    .optional()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("Budget must be a valid non-negative number"),
  body("title").isString(),
  body("destination.city").isString().isLength({ min: 2, max: 100 }),
  body("destination.country").isString().isLength({ min: 2, max: 100 }),
  body("destination.coordinates.lat")
    .optional()
    .isFloat({ min: -90, max: 90 }),
  body("destination.coordinates.lng")
    .optional()
    .isFloat({ min: -180, max: 180 }),
  body("preferences.groupSize")
    .optional()
    .isInt({ min: 1, max: 20 }),
  body("preferences.travelStyle")
    .optional()
    .isIn(["budget", "luxury", "adventure", "mid-range", "relaxation", "cultural"]),
  body("preferences.interests")
    .optional()
    .isArray({ max: 20 }),
  body("preferences.interests.*")
    .optional()
    .isIn(["culture", "nature", "food", "adventure", "relaxation", "shopping", "history", "nightlife", "beach", "photography", "wellness"]),
  body("preferences.accommodation")
    .optional()
    .isIn(["hotel", "hostel", "apartment", "resort", "airbnb", "boutique"]),
  body("preferences.transport")
    .optional()
    .isArray({ max: 10 }),
  body("preferences.transport.*")
    .optional()
    .isIn(["flight", "train", "bus", "car", "walking", "mixed"]),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("endDate").optional().custom((value, { req }) => {
    if (!req.body.startDate || !value) return true;
    const start = new Date(req.body.startDate);
    const end = new Date(value);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
      throw new Error("End date must be on or after start date");
    }
    return true;
  }),
  body("status").optional().isIn(["draft", "upcoming", "ongoing", "completed", "cancelled"]),
  body("description").optional().isString().isLength({ max: 2000 }),
  body("notes").optional().isString().isLength({ max: 2000 }),
  body("isPublic").optional().isBoolean(),
  body("tags").optional().isArray({ max: 20 }),
  body("tags.*").optional().isString().isLength({ max: 30 }),
  validateRequest,
];

const updateTripValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("preferences.duration")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Duration must be between 1 and 365 days"),
  body("description").optional().isString().isLength({ max: 2000 }),
  body("notes").optional().isString().isLength({ max: 2000 }),
  body("isPublic").optional().isBoolean(),
  body("status").optional().isIn(["draft", "upcoming", "ongoing", "completed", "cancelled"]),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  validateRequest,
];

// @route   GET /api/trips/public
// @desc    Get public trips for discovery
// @access  Public
router.get("/public", optionalAuth, getPublicTrips);

// @route   GET /api/trips/stats
// @desc    Get trip statistics for current user
// @access  Private
router.get("/stats", protect, getTripStats);

// @route   GET /api/trips
// @desc    Get all trips for logged in user
// @access  Private
router.get("/", protect, getTrips);

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post("/", protect, tripValidation, createTrip);

// @route   GET /api/trips/upcoming
// @desc    Get upcoming trips
// @access  Private
router.get("/upcoming", protect, async (req, res) => {
  const limit = Number(req.query.limit);
  if (req.query.limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1 || limit > 50)) {
    return res.status(400).json({ success: false, message: "Limit must be between 1 and 50" });
  }

  try {
    const Trip = require("../models/Trip");
    const trips = await Trip.find({
      user: req.user.id,
      startDate: { $gte: new Date() },
      status: { $in: ["draft", "upcoming"] },
    })
      .sort({ startDate: 1 })
      .limit(Number.isInteger(limit) ? limit : 5);

    res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    console.error("Get upcoming trips error:", error);
    res.status(500).json({ success: false, message: "Error fetching upcoming trips" });
  }
});

// @route   GET /api/trips/past
// @desc    Get past trips
// @access  Private
router.get("/past", protect, async (req, res) => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  if (
    (req.query.page !== undefined && (!Number.isInteger(page) || page < 1)) ||
    (req.query.limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 50))
  ) {
    return res.status(400).json({ success: false, message: "Invalid pagination parameters" });
  }

  try {
    const currentPage = Number.isInteger(page) ? page : 1;
    const pageSize = Number.isInteger(limit) ? limit : 10;
    const skip = (currentPage - 1) * pageSize;
    const Trip = require("../models/Trip");
    const baseQuery = {
      user: req.user.id,
      endDate: { $lt: new Date() },
      status: { $in: ["completed", "cancelled"] },
    };
    const trips = await Trip.find(baseQuery)
      .sort({ endDate: -1 })
      .skip(skip)
      .limit(pageSize);
    const total = await Trip.countDocuments(baseQuery);
    const pages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        current: currentPage,
        pages,
        hasNext: currentPage < pages,
        hasPrev: currentPage > 1,
      },
      trips,
    });
  } catch (error) {
    console.error("Get past trips error:", error);
    res.status(500).json({ success: false, message: "Error fetching past trips" });
  }
});

// @route   GET /api/trips/:id
// @desc    Get single trip by ID
// @access  Private
router.get("/:id", protect, getTripById);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put("/:id", protect, updateTripValidation, updateTrip);

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete("/:id", protect, deleteTrip);

// @route   POST /api/trips/:id/clone
// @desc    Clone a trip (public or owned)
// @access  Private
router.post("/:id/clone", protect, cloneTrip);

module.exports = router;
