require("dotenv").config();
const express = require("express");
const cors = require("cors");
const runwayAPI = require("./api/runway.cjs");
const airportsAPI = require("./api/airports.cjs");

const app = express();
const port = process.env.SERVER_PORT_RUNWAY;

if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files (HTML demo)
app.use(
  express.static(".", {
    index: false, // Don't serve index.html automatically
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html");
      }
    },
  })
);

// Demo page endpoint
app.get("/demo", (req, res) => {
  res.sendFile(__dirname + "/demo.html");
});

// Runway API endpoints
app.get("/api/v1/runway/:icao", runwayAPI);

// Airport database API endpoints
app.get("/api/v1/airports/search", ...airportsAPI.searchAirports);
app.get("/api/v1/airports/fuzzy", ...airportsAPI.fuzzySearchAirports);
app.get("/api/v1/airports/suggestions", ...airportsAPI.getSearchSuggestions);
app.get("/api/v1/airports/smart-icao", ...airportsAPI.smartICAOSearch);
app.get("/api/v1/airports/city", ...airportsAPI.searchAirportsByCity);
app.get("/api/v1/airports/country/:countryCode", ...airportsAPI.getAirportsByCountry);
app.get("/api/v1/airports/icao/:icaoCode", ...airportsAPI.getAirportByICAO);
app.get("/api/v1/airports/iata/:iataCode", ...airportsAPI.getAirportByIATA);
app.get("/api/v1/airports/type/:airportType", ...airportsAPI.getAirportsByType);
app.get("/api/v1/airports/nearby", ...airportsAPI.getAirportsNearby);
app.get("/api/v1/airports/stats/countries", ...airportsAPI.getCountryStats);
app.get("/api/v1/airports/info", ...airportsAPI.getDatabaseInfo);

app.get("/", (req, res) => {
  res.json({
    code: 0,
    message: "Welcome to Runway API",
    version: process.env.API_VERSION || "dev",
    demo: "/demo - Interactive HTML demo for airport search",
    endpoints: {
      runway: "/api/v1/runway/:icao - Get runway data for an airport",
      airports: {
        search: "/api/v1/airports/search?q=searchTerm - Search airports",
        byCountry: "/api/v1/airports/country/:countryCode - Get airports by country",
        byICAO: "/api/v1/airports/icao/:icaoCode - Get airport by ICAO code",
        byIATA: "/api/v1/airports/iata/:iataCode - Get airport by IATA code",
        byType: "/api/v1/airports/type/:airportType - Get airports by type",
        nearby: "/api/v1/airports/nearby?lat=&lng= - Get nearby airports",
        stats: "/api/v1/airports/stats/countries - Get country statistics",
        info: "/api/v1/airports/info - Get database information",
      },
    },
  });
});

app.listen(port, () => {
  console.log("Runway app is listening on :" + port);
});
