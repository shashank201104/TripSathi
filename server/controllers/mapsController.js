const { validationResult } = require("express-validator");
const axios = require("axios");

// --------------------------------------------------
// CONFIG
// --------------------------------------------------

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter";
const OSRM_URL = "https://router.project-osrm.org";

const HTTP_HEADERS = {
  "User-Agent": "TripSathi/1.0 (travel-planner)",
  Accept: "application/json",
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;

  const toRadians = (degree) => (degree * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const calculateWalkingTime = (meters) => {
  const walkingSpeed = 80;
  return Math.max(1, Math.round(meters / walkingSpeed));
};

// Accept BOTH:
// lat/lng
// latitude/longitude
const getCoordinates = (query) => {
  const lat = parseFloat(query.lat ?? query.latitude);
  const lon = parseFloat(query.lng ?? query.longitude);

  return { lat, lon };
};

// --------------------------------------------------
// OSM → TRIPSATHI FORMAT
// --------------------------------------------------

const convertOSMPlace = (element, centerLat, centerLon) => {
  const tags = element.tags || {};

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const distance = calculateDistance(
    centerLat,
    centerLon,
    lat,
    lon
  );

  let category = "Place";

  if (tags.amenity === "restaurant") {
    category = "Restaurant";
  } else if (tags.amenity === "cafe") {
    category = "Cafe";
  } else if (tags.amenity === "fast_food") {
    category = "Fast Food";
  } else if (tags.tourism === "hotel") {
    category = "Hotel";
  } else if (
    tags.tourism === "attraction" ||
    tags.tourism === "museum" ||
    tags.tourism === "gallery" ||
    tags.tourism === "viewpoint"
  ) {
    category = "Attraction";
  } else if (tags.historic) {
    category = "Historical Site";
  } else if (tags.leisure === "park") {
    category = "Park";
  }

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  const walkingTime = calculateWalkingTime(distance);

  return {
    id: `osm_${element.type}_${element.id}`,

    osmId: element.id,
    osmType: element.type,

    name:
      tags.name ||
      tags["name:en"] ||
      tags["official_name"] ||
      "Unnamed Place",

    category,

    cuisine: tags.cuisine || null,
    cuisineType: tags.cuisine || null,

    rating: null,
    priceLevel: null,

    location: {
      address:
        addressParts.length > 0
          ? addressParts.join(", ")
          : tags["addr:full"] || null,

      coordinates: {
        lat,
        lng: lon,
      },
    },

    distance: Math.round(distance),
    distanceText: formatDistance(distance),

    walkingTime,
    walkingTimeText: `${walkingTime} min walk`,

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    openingHours:
      tags.opening_hours || null,

    image:
      tags.image ||
      tags["image:url"] ||
      null,

    tags: Object.entries(tags)
      .filter(([key]) =>
        [
          "tourism",
          "amenity",
          "historic",
          "leisure",
          "cuisine",
        ].includes(key)
      )
      .map(([key, value]) => `${key}:${value}`),
  };
};

// --------------------------------------------------
// SEARCH PLACES - NOMINATIM
// --------------------------------------------------

const searchPlaces = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      query,
      location,
      radius = 5000,
      type = "all",
      keyword,
    } = req.query;

    if (!query && !location) {
      return res.status(400).json({
        success: false,
        message: "Query or location is required",
      });
    }

    const searchText = query || location;

    const response = await axios.get(
      `${NOMINATIM_URL}/search`,
      {
        params: {
          q: searchText,
          format: "json",
          addressdetails: 1,
          limit: 10,
        },

        headers: HTTP_HEADERS,
        timeout: 10000,
      }
    );

    let results = response.data.map((item) => ({
      id: `nominatim_${item.place_id}`,

      name:
        item.name ||
        item.display_name?.split(",")[0] ||
        "Place",

      category:
        item.type ||
        item.class ||
        "Place",

      location: {
        address: item.display_name,

        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      },

      type: item.type,
      osmType: item.osm_type,
      osmId: item.osm_id,
    }));

    if (keyword) {
      const keywordLower = keyword.toLowerCase();

      results = results.filter((place) =>
        place.name
          .toLowerCase()
          .includes(keywordLower)
      );
    }

    return res.json({
      success: true,

      data: {
        places: results,
        totalResults: results.length,

        searchParams: {
          query,
          location,
          radius,
          type,
          keyword,
        },
      },
    });
  } catch (error) {
    console.error(
      "Search places provider error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Location search provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// PLACE DETAILS - NOMINATIM
// --------------------------------------------------

const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "Place ID is required",
      });
    }

    /*
      Expected:

      osm_node_123
      osm_way_123
      osm_relation_123
    */

    const parts = placeId.split("_");

    if (parts.length < 3 || parts[0] !== "osm") {
      return res.status(400).json({
        success: false,
        message: "Invalid OSM place ID",
      });
    }

    const osmType = parts[1];
    const osmId = parts.slice(2).join("_");

    const response = await axios.get(
      `${NOMINATIM_URL}/details`,
      {
        params: {
          osmtype:
            osmType === "node"
              ? "N"
              : osmType === "way"
              ? "W"
              : "R",

          osmid: osmId,

          format: "json",
          addressdetails: 1,
        },

        headers: HTTP_HEADERS,
        timeout: 10000,
      }
    );

    const data = response.data;

    const lat = parseFloat(data.lat);
    const lon = parseFloat(data.lon);

    return res.json({
      success: true,

      data: {
        place: {
          id: placeId,

          osmType,
          osmId,

          name:
            data.localname ||
            data.name ||
            "Place",

          location: {
            address:
              data.addresstags
                ? Object.values(data.addresstags).join(", ")
                : null,

            coordinates: {
              lat: Number.isFinite(lat)
                ? lat
                : null,

              lng: Number.isFinite(lon)
                ? lon
                : null,
            },
          },

          address:
            data.address || {},

          extratags:
            data.extratags || {},
        },
      },
    });
  } catch (error) {
    console.error(
      "Get place details error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Place details provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// DIRECTIONS - OSRM
// --------------------------------------------------

const getDirections = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      origin,
      destination,
      mode = "driving",
      waypoints,
      alternatives = false,
    } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message:
          "Origin and destination are required",
      });
    }

    /*
      Format:

      origin=77.2090,28.6139
      destination=77.1025,28.7041

      OSRM:
      longitude,latitude
    */

    const profile =
      mode === "walking"
        ? "foot"
        : mode === "bicycling"
        ? "bike"
        : "driving";

    const waypointList = waypoints
      ? waypoints
          .split("|")
          .filter(Boolean)
      : [];

    const coordinates = [
      origin,
      ...waypointList,
      destination,
    ].join(";");

    const response = await axios.get(
      `${OSRM_URL}/route/v1/${profile}/${coordinates}`,
      {
        params: {
          overview: "full",
          geometries: "geojson",
          steps: true,
          alternatives:
            alternatives === true ||
            alternatives === "true",
        },

        timeout: 20000,
      }
    );

    const routes = response.data.routes || [];

    const formattedRoutes = routes.map(
      (route) => ({
        summary:
          route.legs
            ?.map((leg) => leg.summary)
            .filter(Boolean)
            .join(" → ") ||
          "Route",

        distance: {
          meters: Math.round(
            route.distance || 0
          ),

          text: formatDistance(
            route.distance || 0
          ),
        },

        duration: {
          seconds: Math.round(
            route.duration || 0
          ),

          text: `${Math.round(
            (route.duration || 0) / 60
          )} minutes`,
        },

        geometry: route.geometry,

        steps:
          route.legs
            ?.flatMap(
              (leg) => leg.steps || []
            )
            .map((step) => ({
              instruction:
                step.name ||
                step.maneuver?.type ||
                "Continue",

              distance: Math.round(
                step.distance || 0
              ),

              duration: Math.round(
                step.duration || 0
              ),

              maneuver:
                step.maneuver?.modifier ||
                step.maneuver?.type ||
                null,
            })) || [],
      })
    );

    return res.json({
      success: true,

      data: {
        routes: formattedRoutes,

        origin,
        destination,

        mode,

        waypoints: waypointList,
      },
    });
  } catch (error) {
    console.error(
      "Directions provider error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Routing provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// NEARBY PLACES - OVERPASS
// --------------------------------------------------

const getNearbyPlaces = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    /*
      IMPORTANT:
      Frontend currently sends:

      ?lat=28.6139
      &lng=77.2090

      We also support:

      ?latitude=28.6139
      &longitude=77.2090
    */

    const { lat, lon } = getCoordinates(
      req.query
    );

    const radius =
      parseInt(req.query.radius, 10) || 1000;

    const type = (
      req.query.type || "all"
    ).toLowerCase();

    const keyword =
      req.query.keyword?.trim() || null;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be between -180 and 180",
      });
    }

    if (
      !Number.isFinite(radius) ||
      radius <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Radius must be a positive number",
      });
    }

    const safeRadius = Math.min(
      radius,
      10000
    );

    // ------------------------------------------------
    // BUILD OVERPASS FILTERS
    // ------------------------------------------------

    const filters = [];

    const addFilter = (filter) => {
      filters.push(`
        nwr(
          around:${safeRadius},
          ${lat},
          ${lon}
        )
        ${filter};
      `);
    };

    // Restaurants / cafes
    if (
      type === "all" ||
      type === "restaurant" ||
      type === "restaurants" ||
      type === "food"
    ) {
      addFilter(
        `["amenity"="restaurant"]`
      );

      addFilter(
        `["amenity"="cafe"]`
      );

      addFilter(
        `["amenity"="fast_food"]`
      );
    }

    // Attractions
    if (
      type === "all" ||
      type === "attraction" ||
      type === "attractions" ||
      type === "tourist_attraction" ||
      type === "tourist-attraction"
    ) {
      addFilter(
        `["tourism"="attraction"]`
      );

      addFilter(
        `["tourism"="museum"]`
      );

      addFilter(
        `["tourism"="gallery"]`
      );

      addFilter(
        `["tourism"="viewpoint"]`
      );

      addFilter(
        `["historic"]`
      );

      addFilter(
        `["leisure"="park"]`
      );
    }

    // Hotels
    if (
      type === "all" ||
      type === "hotel" ||
      type === "hotels" ||
      type === "lodging"
    ) {
      addFilter(
        `["tourism"="hotel"]`
      );
    }

    if (filters.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid type. Use restaurant, attraction, tourist_attraction, hotel, or all",
      });
    }

    // ------------------------------------------------
    // OVERPASS QUERY
    // ------------------------------------------------

    const overpassQuery = `
      [out:json][timeout:25];

      (
        ${filters.join("\n")}
      );

      out center tags;
    `;

    console.log(
      `Overpass request: ${type}, ${lat}, ${lon}, radius=${safeRadius}`
    );

    const response = await axios.post(
      OVERPASS_URL,
      overpassQuery,
      {
        headers: {
          ...HTTP_HEADERS,
          "Content-Type":
            "text/plain; charset=utf-8",
        },

        timeout: 30000,

        maxContentLength:
          10 * 1024 * 1024,

        maxBodyLength:
          10 * 1024 * 1024,
      }
    );

    const elements =
      response.data?.elements || [];

    // ------------------------------------------------
    // CONVERT OSM DATA
    // ------------------------------------------------

    let nearbyPlaces = elements
      .map((element) =>
        convertOSMPlace(
          element,
          lat,
          lon
        )
      )
      .filter(Boolean);

    // Remove unnamed places
    nearbyPlaces =
      nearbyPlaces.filter(
        (place) =>
          place.name &&
          place.name !== "Unnamed Place"
      );

    // ------------------------------------------------
    // KEYWORD FILTER
    // ------------------------------------------------

    if (keyword) {
      const keywordLower =
        keyword.toLowerCase();

      nearbyPlaces =
        nearbyPlaces.filter(
          (place) =>
            place.name
              .toLowerCase()
              .includes(keywordLower) ||
            place.category
              .toLowerCase()
              .includes(keywordLower) ||
            place.cuisineType
              ?.toLowerCase()
              .includes(keywordLower)
        );
    }

    // ------------------------------------------------
    // REMOVE DUPLICATES
    // ------------------------------------------------

    const uniquePlaces =
      Array.from(
        new Map(
          nearbyPlaces.map(
            (place) => [
              place.id,
              place,
            ]
          )
        ).values()
      );

    // ------------------------------------------------
    // SORT BY REAL DISTANCE
    // ------------------------------------------------

    uniquePlaces.sort(
      (a, b) =>
        a.distance - b.distance
    );

    console.log(
      `Overpass returned ${uniquePlaces.length} places`
    );

    return res.json({
      success: true,

      data: {
        places: uniquePlaces,

        center: {
          latitude: lat,
          longitude: lon,
        },

        radius: safeRadius,

        totalResults:
          uniquePlaces.length,
      },
    });
  } catch (error) {
    console.error(
      "Nearby places provider error:"
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Response:",
      error.response?.data
    );

    return res.status(502).json({
      success: false,

      message:
        "Nearby places provider is temporarily unavailable",

      provider:
        "OpenStreetMap Overpass",
    });
  }
};

// --------------------------------------------------
// GEOCODING - NOMINATIM
// --------------------------------------------------

const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    const response = await axios.get(
      `${NOMINATIM_URL}/search`,
      {
        params: {
          q: address.trim(),
          format: "json",
          addressdetails: 1,
          limit: 5,
        },

        headers: HTTP_HEADERS,
        timeout: 10000,
      }
    );

    const results =
      response.data.map((item) => ({
        formatted_address:
          item.display_name,

        geometry: {
          location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
        },

        place_id:
          `osm_${item.osm_type}_${item.osm_id}`,

        type: item.type,

        address_components:
          item.address || {},
      }));

    return res.json({
      success: true,

      data: {
        results,

        status:
          results.length > 0
            ? "OK"
            : "ZERO_RESULTS",
      },
    });
  } catch (error) {
    console.error(
      "Geocode provider error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Geocoding provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// REVERSE GEOCODING - NOMINATIM
// --------------------------------------------------

const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } =
      getCoordinates(req.query);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required",
      });
    }

    const response = await axios.get(
      `${NOMINATIM_URL}/reverse`,
      {
        params: {
          lat,
          lon,
          format: "json",
          addressdetails: 1,
        },

        headers: HTTP_HEADERS,
        timeout: 10000,
      }
    );

    const data = response.data;

    return res.json({
      success: true,

      data: {
        results: [
          {
            formatted_address:
              data.display_name,

            types: [
              data.type || "place",
            ],

            place_id:
              data.osm_id
                ? `osm_${data.osm_type}_${data.osm_id}`
                : null,

            address:
              data.address || {},
          },
        ],

        status: "OK",
      },
    });
  } catch (error) {
    console.error(
      "Reverse geocode provider error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Reverse geocoding provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// TRAVEL TIME MATRIX - OSRM
// --------------------------------------------------

const getTravelTimeMatrix = async (
  req,
  res
) => {
  try {
    const {
      origins,
      destinations,
      mode = "driving",
    } = req.query;

    if (!origins || !destinations) {
      return res.status(400).json({
        success: false,
        message:
          "Origins and destinations are required",
      });
    }

    const profile =
      mode === "walking"
        ? "foot"
        : mode === "bicycling"
        ? "bike"
        : "driving";

    const originList =
      origins
        .split("|")
        .filter(Boolean);

    const destinationList =
      destinations
        .split("|")
        .filter(Boolean);

    if (
      originList.length === 0 ||
      destinationList.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid origins and destinations are required",
      });
    }

    const allCoordinates = [
      ...originList,
      ...destinationList,
    ];

    const uniqueCoordinates = [
      ...new Set(allCoordinates),
    ];

    const coordinates =
      uniqueCoordinates.join(";");

    const response = await axios.get(
      `${OSRM_URL}/table/v1/${profile}/${coordinates}`,
      {
        params: {
          annotations:
            "duration,distance",
        },

        timeout: 20000,
      }
    );

    const indexMap = new Map();

    uniqueCoordinates.forEach(
      (coordinate, index) => {
        indexMap.set(
          coordinate,
          index
        );
      }
    );

    const rows = originList.map(
      (origin) => {
        const originIndex =
          indexMap.get(origin);

        return {
          elements:
            destinationList.map(
              (destination) => {
                const destinationIndex =
                  indexMap.get(
                    destination
                  );

                const distance =
                  response.data
                    .distances?.[
                      originIndex
                    ]?.[destinationIndex];

                const duration =
                  response.data
                    .durations?.[
                      originIndex
                    ]?.[destinationIndex];

                if (
                  distance == null ||
                  duration == null
                ) {
                  return {
                    status:
                      "ZERO_RESULTS",
                  };
                }

                return {
                  distance: {
                    text:
                      formatDistance(
                        distance
                      ),

                    value: Math.round(
                      distance
                    ),
                  },

                  duration: {
                    text: `${Math.round(
                      duration / 60
                    )} mins`,

                    value: Math.round(
                      duration
                    ),
                  },

                  status: "OK",
                };
              }
            ),
        };
      }
    );

    return res.json({
      success: true,

      data: {
        origin_addresses:
          originList,

        destination_addresses:
          destinationList,

        rows,

        status: "OK",
      },
    });
  } catch (error) {
    console.error(
      "Travel matrix provider error:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Travel time provider is temporarily unavailable",
    });
  }
};

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

module.exports = {
  searchPlaces,
  getPlaceDetails,
  getDirections,
  getNearbyPlaces,
  geocodeAddress,
  reverseGeocode,
  getTravelTimeMatrix,
};