const axios = require("axios");
const { logger } = require("../middleware/logging");

// Helper to wait (simple backoff)
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const formatDistance = (distanceKm) =>
  distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1)} km`;
class FreeMapService {
  constructor() {
    this.nominatimBase = "https://nominatim.openstreetmap.org";
    this.osrmBase = "https://router.project-osrm.org"; // Public OSRM instance
    // Nominatim requires descriptive User-Agent
    this.userAgent =
      process.env.MAPS_USER_AGENT || "TripSathi/1.0 (TripSathi Project )";
    this.referer = "http://localhost:3000";
  }

  // Validate coordinates
  validateCoordinates(lat, lng) {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  // Haversine distance in km
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(deg) {
    return deg * (Math.PI / 180);
  }

  // Geocode address using Nominatim with fallback
  async geocode(address) {
    try {
      // Add delay to respect Nominatim's usage policy (max 1 request per second)
      await sleep(1500); // Increased to 1.5 seconds for safety

      let response;
      try {
        // Try Nominatim first
        response = await axios.get(`${this.nominatimBase}/search`, {
          params: {
            q: address,
            format: "json",
            addressdetails: 1,
            limit: 1,
          },
          headers: {
            "User-Agent": this.userAgent,
            Referer: this.referer,
          },
          timeout: 10000,
        });
      } catch (nominatimError) {
        // If Nominatim fails with 403, try alternative service
        if (nominatimError.response?.status === 403) {
          logger.warn("Nominatim blocked, using fallback geocoder");
          response = await axios.get("https://geocode.maps.co/search", {
            params: {
              q: address,
              format: "json",
            },
            timeout: 10000,
          });
        } else {
          throw nominatimError;
        }
      }

      if (!response.data || response.data.length === 0) {
        logger.warn(`No geocode results for: ${address}`);
        throw new Error("No results found");
      }

      const r = response.data[0];
      const result = {
        formatted_address: r.display_name,
        location: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
        place_id: r.osm_id || r.place_id,
        types: r.type ? [r.type] : [],
        address_components: r.address || {},
      };
      return result;
    } catch (err) {
      logger.error("Free geocode error:", {
        message: err.message,
        address,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      throw err;
    }
  }

  // Reverse geocode using Nominatim
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.nominatimBase}/reverse`, {
        params: {
          lat,
          lon: lng,
          format: "json",
          addressdetails: 1,
        },
        headers: { "User-Agent": this.userAgent },
      });
      if (!response.data) throw new Error("No reverse geocode result");
      const r = response.data;
      const result = {
        formatted_address: r.display_name,
        location: { lat, lng },
        place_id: r.osm_id,
        types: r.type ? [r.type] : [],
        address_components: r.address || {},
      };
      return result;
    } catch (err) {
      logger.error("Free reverse geocode error", err.message);
      throw err;
    }
  }

  // Map Google-like place type to Overpass filters
  buildOverpassFilter(type) {
    switch (type) {
      case "restaurant":
        return "[amenity=restaurant]";
      case "cafe":
        return "[amenity=cafe]";
      case "lodging":
        return "[tourism=hotel]";
      case "museum":
        return "[tourism=museum]";
      case "park":
        return "[leisure=park]";
      case "shopping_mall":
        return "[shop=mall]";
      case "hospital":
        return "[amenity=hospital]";
      case "pharmacy":
        return "[amenity=pharmacy]";
      case "tourist_attraction":
        return "[tourism=attraction]";
      default:
        return "[amenity]"; // any amenity fallback
    }
  }

  // Nearby search using Overpass (node + ways around center)
  async nearbySearch({ lat, lng, type = "tourist_attraction", radius = 5000 }) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const searchRadius = Number(radius);

    if (
      !this.validateCoordinates(latitude, longitude) ||
      !Number.isFinite(searchRadius) ||
      searchRadius < 100 ||
      searchRadius > 50000
    ) {
      throw new Error("Invalid latitude, longitude or radius");
    }

    let filters;

    switch (type) {
      case "restaurant":
        filters = `
            nwr["amenity"="restaurant"](around:${searchRadius},${latitude},${longitude});
            nwr["amenity"="cafe"](around:${searchRadius},${latitude},${longitude});
            nwr["amenity"="fast_food"](around:${searchRadius},${latitude},${longitude});
          `;
        break;

      case "hotel":
      case "lodging":
        filters = `
            nwr["tourism"="hotel"](around:${searchRadius},${latitude},${longitude});
            nwr["tourism"="guest_house"](around:${searchRadius},${latitude},${longitude});
            nwr["tourism"="hostel"](around:${searchRadius},${latitude},${longitude});
          `;
        break;

      case "tourist_attraction":
      case "attraction":
      default:
        filters = `
            nwr["tourism"="attraction"](around:${searchRadius},${latitude},${longitude});
            nwr["tourism"="museum"](around:${searchRadius},${latitude},${longitude});
            nwr["tourism"="gallery"](around:${searchRadius},${latitude},${longitude});
            nwr["tourism"="viewpoint"](around:${searchRadius},${latitude},${longitude});
            nwr["historic"](around:${searchRadius},${latitude},${longitude});
            nwr["leisure"="park"](around:${searchRadius},${latitude},${longitude});
          `;
        break;
    }

    const query = `
      [out:json][timeout:20];
      (
        ${filters}
      );
      out center tags;
    `;
    const requestBody = new URLSearchParams({ data: query }).toString();
    let response;
    let lastError;

    for (const url of OVERPASS_URLS) {
      try {
        response = await axios.post(url, requestBody, {
          headers: {
            "User-Agent": this.userAgent,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        });
        break;
      } catch (error) {
        lastError = error;
        logger.warn("Overpass request failed; trying next provider", {
          provider: url,
          status: error.response?.status,
          message: error.message,
        });
      }
    }

    if (!response) {
      throw lastError || new Error("All Overpass providers failed");
    }

    const elements = response.data?.elements || [];
    return elements
      .map((element) => {
        const tags = element.tags || {};
        const placeLat = element.lat ?? element.center?.lat;
        const placeLng = element.lon ?? element.center?.lon;

        if (
          !Number.isFinite(Number(placeLat)) ||
          !Number.isFinite(Number(placeLng))
        ) {
          return null;
        }

        const latitudeOfPlace = Number(placeLat);
        const longitudeOfPlace = Number(placeLng);
        const distance = this.calculateDistance(
          latitude,
          longitude,
          latitudeOfPlace,
          longitudeOfPlace
        );
        const vicinity = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:city"],
        ]
          .filter(Boolean)
          .join(", ");

        return {
          place_id: `${element.type}-${element.id}`,
          name: tags.name || tags["name:en"] || "Unnamed place",
          vicinity,
          geometry: {
            location: {
              lat: latitudeOfPlace,
              lng: longitudeOfPlace,
            },
          },
          rating: null,
          price_level: null,
          types: Object.keys(tags).filter((key) => !key.startsWith("addr:")),
          opening_hours: tags.opening_hours || null,
          photos: [],
          distance,
          formattedDistance: formatDistance(distance),
          phone: tags.phone || tags["contact:phone"] || null,
          website: tags.website || tags["contact:website"] || null,
          cuisine: tags.cuisine || null,
          description: tags.description || null,
          source: "OpenStreetMap",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);
  }

  // Text search using Nominatim (broader than nearby)
  async searchPlaces(query, location = null, radius = 50000, type = null) {
    try {
      const response = await axios.get(`${this.nominatimBase}/search`, {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 10,
        },
        headers: { "User-Agent": this.userAgent },
      });
      const results = (response.data || []).map((r) => ({
        place_id: r.osm_id,
        name: r.display_name.split(",")[0],
        formatted_address: r.display_name,
        geometry: {
          location: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
        },
        rating: null,
        price_level: null,
        types: r.type ? [r.type] : [],
        opening_hours: null,
        photos: [],
      }));
      const payload = {
        results,
        status: results.length ? "OK" : "ZERO_RESULTS",
      };
      return payload;
    } catch (err) {
      logger.error("Free search places error", err.message);
      return { results: [], status: "ERROR" };
    }
  }

  // Directions using OSRM
  async getDirections(origin, destination, mode = "driving") {
    try {
      const [oLat, oLng] = origin.split(",").map(parseFloat);
      const [dLat, dLng] = destination.split(",").map(parseFloat);
      const profile =
        mode === "walking" ? "foot" : mode === "bicycling" ? "bike" : "driving"; // OSRM profiles: driving, foot, bicycle (custom instance may differ)

      const url = `${this.osrmBase}/route/v1/${profile}/${oLng},${oLat};${dLng},${dLat}`;
      const response = await axios.get(url, {
        params: { overview: "full", steps: true, geometries: "geojson" },
      });
      if (!response.data || response.data.code !== "Ok") {
        throw new Error("Routing failed");
      }
      const route = response.data.routes[0];
      const leg = route.legs[0];
      const directionsData = {
        routes: [
          {
            summary: "OSRM Route",
            legs: [
              {
                distance: {
                  value: leg.distance,
                  text: `${(leg.distance / 1000).toFixed(2)} km`,
                },
                duration: {
                  value: leg.duration,
                  text: `${Math.round(leg.duration / 60)} mins`,
                },
                start_address: origin,
                end_address: destination,
                start_location: { lat: oLat, lng: oLng },
                end_location: { lat: dLat, lng: dLng },
                steps: leg.steps.map((s) => ({
                  distance: {
                    value: s.distance,
                    text: `${Math.round(s.distance)} m`,
                  },
                  duration: {
                    value: s.duration,
                    text: `${Math.round(s.duration)} s`,
                  },
                  instructions: s.name || s.maneuver.type,
                  start_location: {
                    lat: s.maneuver.location[1],
                    lng: s.maneuver.location[0],
                  },
                  end_location: {
                    lat: s.maneuver.location[1],
                    lng: s.maneuver.location[0],
                  },
                  travel_mode: profile.toUpperCase(),
                })),
              },
            ],
            overview_polyline: route.geometry, // GeoJSON line
            bounds: null,
          },
        ],
        status: "OK",
      };
      return directionsData;
    } catch (err) {
      logger.error("Free directions error", err.message);
      throw err;
    }
  }
}

module.exports = new FreeMapService();
