require("dotenv").config();
const express = require("express");
const { createJam, addLocation, getJamById } = require("./jamStore");

const app = express();
const PORT = process.env.PORT || 3000;
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT || "Halfway/0.1 (local dev)";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/jams", async (req, res) => {
  try {
    const jam = await createJam();
    res.status(201).json({ id: jam.id });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.post("/jams/:id/locations", async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat and lng must be numbers" });
  }

  try {
    const jam = await addLocation(id, { lat, lng });
    if (!jam) {
      return res.status(404).json({ error: "jam not found" });
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.get("/jams/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const jam = await getJamById(id);

    if (!jam) {
      return res.status(404).json({ error: "jam not found" });
    }

    res.json({
      id: jam.id,
      createdAt: jam.createdAt,
      locationCount: jam.locations.length
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

function pickArea(address) {
  if (!address) {
    return null;
  }

  return (
    address.neighbourhood ||
    address.suburb ||
    address.quarter ||
    address.city_district ||
    address.town ||
    address.city ||
    address.county ||
    address.state ||
    null
  );
}

app.get("/jams/:id/result", async (req, res) => {
  const { id } = req.params;
  let jam;
  try {
    jam = await getJamById(id);
  } catch (error) {
    return res.status(500).json({ error: "server error" });
  }

  if (!jam) {
    return res.status(404).json({ error: "jam not found" });
  }

  if (jam.locations.length === 0) {
    return res.status(400).json({ error: "no locations yet" });
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const location of jam.locations) {
    sumLat += location.lat;
    sumLng += location.lng;
  }

  const lat = sumLat / jam.locations.length;
  const lng = sumLng / jam.locations.length;

  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("accept-language", "tr");

  try {
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": NOMINATIM_USER_AGENT }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "nominatim error" });
    }

    const data = await response.json();
    const area = pickArea(data.address) || data.display_name || null;

    res.json({ lat, lng, area });
  } catch (error) {
    res.status(502).json({ error: "nominatim request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
