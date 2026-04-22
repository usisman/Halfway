const crypto = require("crypto");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function createJam() {
  const id = crypto.randomUUID();
  const result = await pool.query(
    "insert into jams (id) values ($1) returning id, created_at",
    [id]
  );
  const row = result.rows[0];

  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    locations: []
  };
}

async function getJamById(id) {
  const jamResult = await pool.query(
    "select id, created_at from jams where id = $1",
    [id]
  );

  if (jamResult.rowCount === 0) {
    return null;
  }

  const locationsResult = await pool.query(
    "select lat, lng from locations where jam_id = $1 order by id asc",
    [id]
  );

  const row = jamResult.rows[0];
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    locations: locationsResult.rows
  };
}

async function addLocation(jamId, location) {
  const jamResult = await pool.query("select id from jams where id = $1", [
    jamId
  ]);

  if (jamResult.rowCount === 0) {
    return null;
  }

  await pool.query(
    "insert into locations (jam_id, lat, lng) values ($1, $2, $3)",
    [jamId, location.lat, location.lng]
  );

  return { id: jamId };
}

module.exports = {
  createJam,
  getJamById,
  addLocation
};
