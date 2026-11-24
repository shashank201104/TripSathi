const express = require("express");
const { protect: auth } = require("../middleware/auth");
const freeMapService = require("../services/freeMapService");
const User = require("../models/User");
const { logger } = require("../middleware/logging");

const router = express.Router();

const strictNumber = (value) => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (!/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/.test(String(value).trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const coordinateQuery = (req, res, next) => {
  const lat = strictNumber(req.query.lat);
  const lng = strictNumber(req.query.lng);
  if (lat === null || lat < -90 || lat > 90 ||
      lng === null || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude must be valid coordinates",
    });
  }
  req.query.lat = lat;
  req.query.lng = lng;
  next();
};

/**
 * @route   GET /api/maps/places/nearby
 * @desc    Get nearby places (hotels, restaurants, attractions) using OSM/Overpass
 */
router.get("/places/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type = "tourist_attraction", keyword } = req.query;
    const parsedLat = strictNumber(lat);
    const parsedLng = strictNumber(lng);
    const parsedRadius = strictNumber(radius);
    if (parsedLat === null || parsedLat < -90 || parsedLat > 90 ||
        parsedLng === null || parsedLng < -180 || parsedLng > 180 ||
        parsedRadius === null || parsedRadius < 1 || parsedRadius > 50000 ||
        (keyword !== undefined && (typeof keyword !== "string" || keyword.length > 100))) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude, longitude, radius, or keyword",
      });
    }

    const location = `${parsedLat},${parsedLng}`;
    const data = await freeMapService.nearbySearch(
      location,
      parsedRadius,
      type,
      keyword
    );

    res.json({
      success: true,
      data: {
        places: data.results,
        status: data.status
      },
    });
  } catch (error) {
    logger.error("Nearby places error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby places",
    });
  }
});

/**
 * @route   GET /api/maps/places/search
 * @desc    Search for places using Nominatim
 */
router.get("/places/search", async (req, res) => {
  try {
    const { query, location, radius = 50000, type } = req.query;
    const parsedRadius = strictNumber(radius);
    if (typeof query !== "string" || query.trim().length < 2 ||
        query.trim().length > 160 || parsedRadius === null ||
        parsedRadius < 1 || parsedRadius > 500000 ||
        (location !== undefined && (typeof location !== "string" || location.length > 160))) {
      return res.status(400).json({
        success: false,
        message: "Invalid place search parameters",
      });
    }

    const data = await freeMapService.searchPlaces(
      query,
      location,
      parsedRadius,
      type
    );

    res.json({
      success: true,
      data: {
        places: data.results,
        status: data.status
      },
    });
  } catch (error) {
    logger.error("Places search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching places",
    });
  }
});

/**
 * @route   GET /api/maps/geocode
 * @desc    Geocode an address to coordinates using Nominatim
 */
router.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (typeof address !== "string" || address.trim().length < 2 ||
        address.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Address must be between 2 and 500 characters",
      });
    }

    const result = await freeMapService.geocode(address);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error("Geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error geocoding address",
    });
  }
});

/**
 * @route   GET /api/maps/reverse-geocode
 * @desc    Reverse geocode coordinates to address
 */
router.get("/reverse-geocode", coordinateQuery, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const result = await freeMapService.reverseGeocode(Number(lat), Number(lng));

    res.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error("Reverse geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error reverse geocoding coordinates",
    });
  }
});

/**
 * @route   GET /api/maps/directions
 * @desc    Get directions using OSRM
 */
router.get("/directions", async (req, res) => {
  try {
    const { origin, destination, mode = "driving" } = req.query;
    const allowedModes = new Set(["driving", "walking", "cycling"]);
    if (typeof origin !== "string" || typeof destination !== "string" ||
        origin.trim().length < 3 || origin.trim().length > 160 ||
        destination.trim().length < 3 || destination.trim().length > 160 ||
        !allowedModes.has(mode)) {
      return res.status(400).json({
        success: false,
        message: "Origin, destination, and travel mode are invalid",
      });
    }

    const data = await freeMapService.getDirections(origin, destination, mode);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error("Directions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching directions",
    });
  }
});

// --- SAVED LOCATIONS (Database Logic) ---

/**
 * @route   POST /api/maps/save-location
 * @desc    Save user's current location
 * @access  Private
 */
router.post("/save-location", auth, async (req, res) => {
  try {
    const { name, lat, lng, address } = req.body;
    const parsedLat = strictNumber(lat);
    const parsedLng = strictNumber(lng);
    if (typeof name !== "string" || name.trim().length < 2 ||
        name.trim().length > 80 || parsedLat === null ||
        parsedLat < -90 || parsedLat > 90 || parsedLng === null ||
        parsedLng < -180 || parsedLng > 180 ||
        (address !== undefined && (typeof address !== "string" || address.length > 500))) {
      return res.status(400).json({
        success: false,
        message: "Invalid location name or coordinates",
      });
    }

    // Get address if not provided
    let locationAddress = address;
    if (!locationAddress) {
      try {
      const rev = await freeMapService.reverseGeocode(parsedLat, parsedLng);
        locationAddress = rev.formatted_address;
      } catch (err) {
        locationAddress = `${lat}, ${lng}`;
      }
    }

    const user = await User.findById(req.user.id);

    // Check if location already exists (100m proximity)
    const existingLocation = user.savedDestinations.find(
      (dest) =>
        freeMapService.calculateDistance(
          dest.coordinates.lat,
          dest.coordinates.lng,
          parsedLat,
          parsedLng
        ) < 0.1
    );

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location already saved",
      });
    }

    user.savedDestinations.push({
      name: name.trim(),
      coordinates: { lat: parsedLat, lng: parsedLng },
      address: locationAddress,
    });

    await user.save();

    res.json({
      success: true,
      message: "Location saved successfully",
      data: {
        savedDestinations: user.savedDestinations,
      },
    });
  } catch (error) {
    logger.error("Save location error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving location",
    });
  }
});

/**
 * @route   GET /api/maps/saved-locations
 * @desc    Get user's saved locations
 * @access  Private
 */
router.get("/saved-locations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        savedDestinations: user.savedDestinations,
      },
    });
  } catch (error) {
    logger.error("Get saved locations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching saved locations",
    });
  }
});

/**
 * @route   DELETE /api/maps/saved-locations/:id
 * @desc    Remove a saved location
 * @access  Private
 */
router.delete("/saved-locations/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const locationIndex = user.savedDestinations.findIndex(
      (dest) => dest._id.toString() === req.params.id
    );

    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

    user.savedDestinations.splice(locationIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: "Location removed successfully",
      data: {
        savedDestinations: user.savedDestinations,
      },
    });
  } catch (error) {
    logger.error("Remove saved location error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing saved location",
    });
  }
});

module.exports = router;
