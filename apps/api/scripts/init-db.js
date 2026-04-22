const path = require("path");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const statements = [
  `create table if not exists jams (
    id uuid primary key,
    created_at timestamptz not null default now()
  );`,
  `create table if not exists locations (
    id bigserial primary key,
    jam_id uuid not null references jams(id) on delete cascade,
    lat double precision not null,
    lng double precision not null,
    created_at timestamptz not null default now()
  );`,
  "create index if not exists locations_jam_id_idx on locations(jam_id);"
];

async function main() {
  try {
    for (const sql of statements) {
      await pool.query(sql);
    }
    console.log("DB init done");
  } catch (error) {
    console.error("DB init failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
