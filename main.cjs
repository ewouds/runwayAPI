require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');
const runwayAPI = require("./api/runway.cjs");
const airportsAPI = require("./api/airports.cjs");

const app = express();
const port = process.env.SERVER_PORT_RUNWAY;

if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

// Load OpenAPI specification
let swaggerSpec;
try {
  const yamlFile = fs.readFileSync(path.join(__dirname, 'docs', 'openapi.yaml'), 'utf8');
  swaggerSpec = YAML.load(yamlFile);
  // Update server URL with current host
  swaggerSpec.servers[0].url = `http://localhost:${port}`;
} catch (error) {
  console.error('Failed to load OpenAPI spec:', error.message);
  // Fallback basic spec
  swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'RunwayAPI',
      version: '1.0.0',
      description: 'European Airports Database API'
    },
    servers: [{ url: `http://localhost:${port}` }],
    paths: {}
  };
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

// OpenAPI Documentation endpoints
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "RunwayAPI Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    explorer: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Raw OpenAPI spec endpoint
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// Demo page endpoint
app.get("/demo", (req, res) => {
  res.sendFile(__dirname + "/demo.html");
});

// Test App endpoint
app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/test-app.html");
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
    version: process.env.API_VERSION || "1.0.0",
    documentation: {
      openapi: "/docs - Interactive OpenAPI documentation",
      demo: "/demo - Interactive HTML demo for airport search",
      testApp: "/test - Comprehensive API test application"
    },
    endpoints: {
      runway: "/api/v1/runway/:icao - Get runway data for an airport",
      airports: {
        search: "/api/v1/airports/search?q=searchTerm - Search airports",
        fuzzy: "/api/v1/airports/fuzzy?q=searchTerm - Advanced fuzzy search",
        city: "/api/v1/airports/city?q=cityName - Search by city name",
        smartIcao: "/api/v1/airports/smart-icao?q=icaoCode - Smart ICAO search",
        suggestions: "/api/v1/airports/suggestions?q=partial - Get suggestions",
        byCountry: "/api/v1/airports/country/:countryCode - Get airports by country",
        byICAO: "/api/v1/airports/icao/:icaoCode - Get airport by ICAO code",
        byIATA: "/api/v1/airports/iata/:iataCode - Get airport by IATA code",
        byType: "/api/v1/airports/type/:airportType - Get airports by type",
        nearby: "/api/v1/airports/nearby?lat=&lng= - Get nearby airports",
        stats: "/api/v1/airports/stats/countries - Get country statistics",
        info: "/api/v1/airports/info - Get database information",
      },
    },
    database: {
      totalAirports: 12228,
      countries: 52,
      features: ["Fuzzy Search", "Typo Tolerance", "Geographic Search", "Real-time Weather"]
    }
  });
});

app.listen(port, () => {
  console.log("Runway app is listening on :" + port);
});
