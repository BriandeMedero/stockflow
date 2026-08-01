const path = require("path");

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

require("dotenv").config({
    path: path.resolve(__dirname, "..", envFile)
});

const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

module.exports = pool;