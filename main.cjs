require("dotenv").config();
const express = require("express");
const cors = require("cors");
const runwayAPI = require("./api/runway.cjs");

const app = express();
const port = process.env.SERVER_PORT_RUNWAY;

if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/v1/runway/:icao", runwayAPI);

app.get("/", (req, res) => {
  res.json({
    code: 0,
    message: "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",
    version: process.env.API_VERSION || "dev",
  });
});

app.listen(port, () => {
  console.log("Runway app is listening on :" + port);
});
