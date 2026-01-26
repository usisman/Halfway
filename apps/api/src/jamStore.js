const jams = new Map();
const crypto = require("crypto");

function createJam() {
  const id = crypto.randomUUID();

  const jam = {
    id,
    createdAt: new Date().toISOString(),
    locations: []
  };

  jams.set(id, jam);
  return jam;
}

function getJamById(id) {
  return jams.get(id) || null;
}

function addLocation(jamId, location) {
  const jam = jams.get(jamId);
  if (!jam) {
    return null;
  }

  jam.locations.push(location);
  return jam;
}

module.exports = {
  createJam,
  getJamById,
  addLocation
};
