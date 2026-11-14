import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapsAPI } from "../../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const defaultCenter = [20.5937, 78.9629];

const getCoordinates = (coordinates) => {
  if (
    coordinates?.lat === null ||
    coordinates?.lat === undefined ||
    coordinates?.lat === "" ||
    coordinates?.lng === null ||
    coordinates?.lng === undefined ||
    coordinates?.lng === ""
  ) {
    return null;
  }
  const lat = Number(coordinates?.lat);
  const lng = Number(coordinates?.lng);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }
  return [lat, lng];
};

const MapBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    const points = locations
      .map((location) => location.position)
      .filter(Boolean);
    if (points.length > 1) {
      map.fitBounds(points, { padding: [32, 32], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [locations, map]);

  return null;
};

const getItineraryLocations = (itinerary, destination) => {
  const locations = [];
  const days = Array.isArray(itinerary?.itinerary) ? itinerary.itinerary : [];

  days.forEach((day, dayIndex) => {
    (day.activities || []).forEach((activity) => {
      const name =
        activity.location?.name ||
        (typeof activity.location === "string" ? activity.location : "") ||
        activity.title ||
        activity.activity ||
        activity.name;
      if (!name) return;
      locations.push({
        name,
        address: activity.location?.address || "",
        day: day.day || dayIndex + 1,
        type: activity.type || "Activity",
        position: getCoordinates(activity.location?.coordinates),
      });
    });

    (day.meals || []).forEach((meal) => {
      const name = meal.location?.name || meal.restaurant;
      if (!name) return;
      locations.push({
        name,
        address: meal.location?.address || "",
        day: day.day || dayIndex + 1,
        type: meal.type || meal.cuisine || "Dining",
        position: getCoordinates(meal.location?.coordinates),
      });
    });

    if (day.accommodation?.name) {
      locations.push({
        name: day.accommodation.name,
        address: day.accommodation.address || "",
        day: day.day || dayIndex + 1,
        type: "Accommodation",
        position: getCoordinates(day.accommodation.location?.coordinates),
      });
    }
  });

  const seen = new Set();
  return locations.filter((location) => {
    const key = `${location.day}:${location.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((location) => ({
    ...location,
    searchAddress: [location.name, location.address, destination]
      .filter(Boolean)
      .join(", "),
  }));
};

const ItineraryMap = ({ itinerary, destination }) => {
  const locations = useMemo(
    () => getItineraryLocations(itinerary, destination),
    [itinerary, destination]
  );
  const [mappedLocations, setMappedLocations] = useState(locations);
  const [lookup, setLookup] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    const directLocations = locations.filter((location) => location.position);
    const locationsToFind = locations.filter((location) => !location.position);
    setMappedLocations(directLocations);
    setLookup({ completed: 0, total: locationsToFind.length });

    const resolveLocations = async () => {
      const resolved = [...directLocations];
      for (const [index, location] of locationsToFind.entries()) {
        if (cancelled) return;
        try {
          const response = await mapsAPI.geocodeAddress({
            address: location.searchAddress,
          });
          const position = getCoordinates(response.data?.result?.location);
          if (position) resolved.push({ ...location, position });
        } catch (error) {
          console.warn(`Could not find map coordinates for ${location.name}`, error);
        }
        if (!cancelled) {
          setMappedLocations([...resolved]);
          setLookup({ completed: index + 1, total: locationsToFind.length });
        }
      }
    };

    resolveLocations();
    return () => {
      cancelled = true;
    };
  }, [locations]);

  const mapCenter = mappedLocations[0]?.position || defaultCenter;
  const missingCount = locations.length - mappedLocations.length;

  if (locations.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-border bg-surface-elevated p-6 text-center text-sm text-text-secondary">
        No named places were included in this itinerary.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative h-72 w-full sm:h-96">
        <MapContainer
          center={mapCenter}
          zoom={5}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapBounds locations={mappedLocations} />
          {mappedLocations.map((location, index) => (
            <Marker key={`${location.day}-${location.name}-${index}`} position={location.position}>
              <Popup>
                <strong>{location.name}</strong>
                <br />
                Day {location.day} · {location.type}
                {location.address && (
                  <>
                    <br />
                    {location.address}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">
          {mappedLocations.length} of {locations.length} places mapped
        </p>
        {lookup.completed < lookup.total && (
          <p role="status" className="text-xs text-text-secondary">
            Finding locations {lookup.completed}/{lookup.total}…
          </p>
        )}
        {missingCount > 0 && lookup.completed === lookup.total && (
          <p role="status" className="text-xs text-warning">
            {missingCount} place{missingCount === 1 ? "" : "s"} could not be located.
          </p>
        )}
      </div>
      <ol className="grid max-h-56 gap-1 overflow-y-auto p-3 sm:grid-cols-2">
        {locations.map((location, index) => {
          const isMapped = mappedLocations.some(
            (mapped) =>
              mapped.day === location.day && mapped.name === location.name
          );
          return (
            <li
              key={`${location.day}-${location.name}-${index}`}
              className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isMapped
                    ? "bg-accent text-bg"
                    : "bg-surface-elevated text-text-secondary"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-text-primary">
                  {location.name}
                </span>
                <span className="text-text-secondary">
                  Day {location.day} · {location.type}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ItineraryMap;
