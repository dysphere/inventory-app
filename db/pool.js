// Set up postgresql connection
const { Pool } = require("pg");

module.exports = new Pool({
  host: "localhost", // or wherever the db is hosted
  user: process.env.DB_USER,
  database: "inventory",
  password: process.env.DB_PW,
  port: 5432 // The default port
});