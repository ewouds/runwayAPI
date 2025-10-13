/**
 * Airport Database REST API Endpoints
 * Provides comprehensive RESTful access to EU airports database with fuzzy search
 */

const AirportsDB = require("../airportDB/database.cjs");

// Database singleton
const db = new AirportsDB();
let isConnected = false;

// Auto-connect on module load
(async () => {
  try {
    await db.connect();
    isConnected = true;
    console.log("Airport database connected successfully");
  } catch (error) {
    console.error("Failed to connect to airport database:", error);
  }
})();

// Database connection middleware
const ensureDBConnection = async (req, res, next) => {
  if (!isConnected) {
    try {
      await db.connect();
      isConnected = true;
    } catch (error) {
      return res.status(500).json({
        code: 1,
        message: "Database connection failed",
        error: error.message,
      });
    }
  }
  next();
};

/**
 * GET /api/v1/airports/search?q=:searchTerm&limit=:limit&fuzzy=:boolean
 * Search airports by name, code, or municipality with optional fuzzy matching
 */
const searchAirports = async (req, res) => {
  try {
    const { q: searchTerm, limit = 20, fuzzy = "false" } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        code: 1,
        message: "Search term (q) parameter is required",
      });
    }

    const useFuzzy = fuzzy.toLowerCase() === "true";
    let results;

    if (useFuzzy) {
      results = await db.enhancedSearch(searchTerm, parseInt(limit));
    } else {
      results = await db.searchAirports(searchTerm, parseInt(limit));
    }

    res.json({
      code: 0,
      message: "Search completed successfully",
      data: {
        searchTerm,
        searchType: useFuzzy ? "fuzzy" : "exact",
        count: results.length,
        limit: parseInt(limit),
        airports: results,
      },
    });
  } catch (error) {
    console.error("Search airports error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/country/:countryCode?limit=:limit
 * Get airports by country ISO code
 */
const getAirportsByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 50, type } = req.query;

    if (!countryCode || countryCode.length !== 2) {
      return res.status(400).json({
        code: 1,
        message: "Valid 2-letter country ISO code is required",
      });
    }

    let results = await db.getAirportsByCountry(countryCode.toUpperCase(), parseInt(limit));

    // Filter by type if specified
    if (type) {
      results = results.filter((airport) => airport.type === type);
    }

    res.json({
      code: 0,
      message: "Airports retrieved successfully",
      data: {
        countryCode: countryCode.toUpperCase(),
        type: type || "all",
        count: results.length,
        limit: parseInt(limit),
        airports: results,
      },
    });
  } catch (error) {
    console.error("Get airports by country error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/icao/:icaoCode
 * Get airport by ICAO code
 */
const getAirportByICAO = async (req, res) => {
  try {
    const { icaoCode } = req.params;

    if (!icaoCode || icaoCode.length !== 4) {
      return res.status(400).json({
        code: 1,
        message: "Valid 4-letter ICAO code is required",
      });
    }

    const airport = await db.getAirportByICAO(icaoCode.toUpperCase());

    if (!airport) {
      return res.status(404).json({
        code: 1,
        message: `Airport with ICAO code ${icaoCode.toUpperCase()} not found`,
      });
    }

    res.json({
      code: 0,
      message: "Airport retrieved successfully",
      data: {
        airport,
      },
    });
  } catch (error) {
    console.error("Get airport by ICAO error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/iata/:iataCode
 * Get airport by IATA code
 */
const getAirportByIATA = async (req, res) => {
  try {
    const { iataCode } = req.params;

    if (!iataCode || iataCode.length !== 3) {
      return res.status(400).json({
        code: 1,
        message: "Valid 3-letter IATA code is required",
      });
    }

    const airport = await db.getAirportByIATA(iataCode.toUpperCase());

    if (!airport) {
      return res.status(404).json({
        code: 1,
        message: `Airport with IATA code ${iataCode.toUpperCase()} not found`,
      });
    }

    res.json({
      code: 0,
      message: "Airport retrieved successfully",
      data: {
        airport,
      },
    });
  } catch (error) {
    console.error("Get airport by IATA error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/type/:airportType?limit=:limit
 * Get airports by type (large_airport, medium_airport, etc.)
 */
const getAirportsByType = async (req, res) => {
  try {
    const { airportType } = req.params;
    const { limit = 50 } = req.query;

    const validTypes = ["large_airport", "medium_airport", "small_airport", "heliport", "seaplane_base", "balloonport", "closed"];

    if (!validTypes.includes(airportType)) {
      return res.status(400).json({
        code: 1,
        message: `Invalid airport type. Valid types: ${validTypes.join(", ")}`,
      });
    }

    const results = await db.getAirportsByType(airportType, parseInt(limit));

    res.json({
      code: 0,
      message: "Airports retrieved successfully",
      data: {
        type: airportType,
        count: results.length,
        limit: parseInt(limit),
        airports: results,
      },
    });
  } catch (error) {
    console.error("Get airports by type error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/nearby?lat=:latitude&lng=:longitude&radius=:radius&limit=:limit
 * Get airports near specific coordinates
 */
const getAirportsNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 1.0, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        code: 1,
        message: "Latitude (lat) and longitude (lng) parameters are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusDegrees = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusDegrees)) {
      return res.status(400).json({
        code: 1,
        message: "Invalid coordinate values. Must be valid numbers",
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        code: 1,
        message: "Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180",
      });
    }

    const results = await db.getAirportsNearby(latitude, longitude, radiusDegrees, parseInt(limit));

    res.json({
      code: 0,
      message: "Nearby airports retrieved successfully",
      data: {
        center: { latitude, longitude },
        radius: radiusDegrees,
        count: results.length,
        limit: parseInt(limit),
        airports: results,
      },
    });
  } catch (error) {
    console.error("Get nearby airports error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/stats/countries
 * Get airport statistics by country
 */
const getCountryStats = async (req, res) => {
  try {
    const stats = await db.getCountryStats();

    res.json({
      code: 0,
      message: "Country statistics retrieved successfully",
      data: {
        count: stats.length,
        countries: stats,
      },
    });
  } catch (error) {
    console.error("Get country stats error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/fuzzy?q=:searchTerm&limit=:limit&details=:boolean&format=simple
 * Fuzzy search airports with scoring details and optional simple format
 */
const fuzzySearchAirports = async (req, res) => {
  try {
    const { q: searchTerm, limit = 20, details = "false", format = "full" } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        code: 1,
        message: "Search term (q) parameter is required",
      });
    }

    const includeDetails = details.toLowerCase() === "true";
    const useSimpleFormat = format.toLowerCase() === "simple";

    const results = await db.fuzzySearchAirports(searchTerm, {
      limit: parseInt(limit),
      includeDetails: !useSimpleFormat, // Don't include details if using simple format
    });

    // Format results based on requested format
    let formattedResults;

    if (useSimpleFormat) {
      // Simple format: only ICAO code, city name, and country
      formattedResults = results
        .map((result) => ({
          icao_code: result.icao_code || null,
          city: result.municipality || null,
          country: result.country_name || null,
        }))
        .filter((airport) => airport.icao_code && airport.city); // Filter out airports without ICAO or city
    } else {
      formattedResults = results;
    }

    res.json({
      code: 0,
      message: "Fuzzy search completed successfully",
      data: {
        searchTerm,
        searchType: "fuzzy",
        format: useSimpleFormat ? "simple" : "full",
        count: formattedResults.length,
        limit: parseInt(limit),
        airports: formattedResults,
      },
    });
  } catch (error) {
    console.error("Fuzzy search error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/suggestions?q=:searchTerm&limit=:limit
 * Get search suggestions for autocomplete
 */
const getSearchSuggestions = async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.json({
        code: 0,
        message: "Search suggestions retrieved successfully",
        data: {
          searchTerm: searchTerm || "",
          suggestions: [],
        },
      });
    }

    const suggestions = await db.getSearchSuggestions(searchTerm, parseInt(limit));

    res.json({
      code: 0,
      message: "Search suggestions retrieved successfully",
      data: {
        searchTerm,
        count: suggestions.length,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/smart-icao?q=:searchTerm&limit=:limit
 * Smart ICAO code search with typo tolerance
 */
const smartICAOSearch = async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        code: 1,
        message: "Search term (q) parameter is required",
      });
    }

    if (searchTerm.length < 3) {
      return res.status(400).json({
        code: 1,
        message: "Search term must be at least 3 characters for ICAO search",
      });
    }

    const results = await db.smartICAOSearch(searchTerm, parseInt(limit));

    res.json({
      code: 0,
      message: "Smart ICAO search completed successfully",
      data: {
        searchTerm,
        searchType: "smart-icao",
        count: results.length,
        limit: parseInt(limit),
        airports: results,
      },
    });
  } catch (error) {
    console.error("Smart ICAO search error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/city?q=cityName&limit=20&fuzzy=true&format=simple
 * Search airports by city/municipality name with optional fuzzy matching
 */
const searchAirportsByCity = async (req, res) => {
  try {
    const { q: query, limit = 20, fuzzy = "true", format = "full" } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        code: 1,
        message: 'Query parameter "q" is required and must be at least 2 characters',
      });
    }

    const searchLimit = Math.min(parseInt(limit) || 20, 100);
    const useFuzzy = fuzzy.toLowerCase() === "true";
    const useSimpleFormat = format.toLowerCase() === "simple";

    let results;

    if (useFuzzy) {
      // Use fuzzy search specifically optimized for city names
      results = await db.fuzzyCitySearch(query.trim(), {
        limit: searchLimit,
        includeDetails: !useSimpleFormat,
      });
    } else {
      // Use exact city search
      results = await db.searchAirportsByCity(query.trim(), searchLimit);
    }

    // Format results based on requested format
    let formattedResults;

    if (useSimpleFormat) {
      // Simple format: only ICAO code, city name, and country
      formattedResults = results
        .map((result) => {
          const airport = result.airport || result;
          return {
            icao_code: airport.icao_code || null,
            city: airport.municipality || null,
            country: airport.country_name || null,
          };
        })
        .filter((airport) => airport.icao_code && airport.city); // Filter out airports without ICAO or city
    } else {
      // Full format: include all details and fuzzy scores
      formattedResults = results.map((result) => {
        if (result.score !== undefined) {
          return {
            ...(result.airport || result),
            fuzzyScore: result.score,
            matchDetails: result.details,
          };
        }
        return result;
      });
    }

    res.json({
      code: 0,
      message: "City search completed successfully",
      data: {
        query: query.trim(),
        fuzzyEnabled: useFuzzy,
        format: useSimpleFormat ? "simple" : "full",
        count: formattedResults.length,
        limit: searchLimit,
        airports: formattedResults,
      },
    });
  } catch (error) {
    console.error("City search error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/airports/info
 * Get general database information
 */
const getDatabaseInfo = async (req, res) => {
  try {
    // This would ideally come from database metadata, but we'll provide static info
    res.json({
      code: 0,
      message: "Database information retrieved successfully",
      data: {
        name: "EU Airports Database",
        description: "Comprehensive database of European airports with fuzzy search capabilities",
        totalRecords: 12228,
        uniqueCountries: 52,
        largeAirports: 118,
        scheduledServiceAirports: 659,
        availableTypes: ["large_airport", "medium_airport", "small_airport", "heliport", "seaplane_base", "balloonport", "closed"],
        fuzzySearchFeatures: [
          "Typo tolerance (Levenshtein distance)",
          "Phonetic matching (Soundex)",
          "Character transposition detection",
          "Jaro-Winkler similarity scoring",
          "Multi-field weighted scoring",
          "Smart autocomplete suggestions",
        ],
        endpoints: {
          search: "/api/v1/airports/search?q=searchTerm&limit=20&fuzzy=true",
          fuzzySearch: "/api/v1/airports/fuzzy?q=searchTerm&limit=20&details=true",
          suggestions: "/api/v1/airports/suggestions?q=searchTerm&limit=10",
          smartICAO: "/api/v1/airports/smart-icao?q=icaoCode&limit=10",
          byCountry: "/api/v1/airports/country/:countryCode?limit=50&type=large_airport",
          byICAO: "/api/v1/airports/icao/:icaoCode",
          byIATA: "/api/v1/airports/iata/:iataCode",
          byType: "/api/v1/airports/type/:airportType?limit=50",
          nearby: "/api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=1.0&limit=20",
          countryStats: "/api/v1/airports/stats/countries",
          info: "/api/v1/airports/info",
        },
      },
    });
  } catch (error) {
    console.error("Get database info error:", error);
    res.status(500).json({
      code: 1,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Export all endpoint functions with middleware
module.exports = {
  searchAirports: [ensureDBConnection, searchAirports],
  fuzzySearchAirports: [ensureDBConnection, fuzzySearchAirports],
  getSearchSuggestions: [ensureDBConnection, getSearchSuggestions],
  smartICAOSearch: [ensureDBConnection, smartICAOSearch],
  searchAirportsByCity: [ensureDBConnection, searchAirportsByCity],
  getAirportsByCountry: [ensureDBConnection, getAirportsByCountry],
  getAirportByICAO: [ensureDBConnection, getAirportByICAO],
  getAirportByIATA: [ensureDBConnection, getAirportByIATA],
  getAirportsByType: [ensureDBConnection, getAirportsByType],
  getAirportsNearby: [ensureDBConnection, getAirportsNearby],
  getCountryStats: [ensureDBConnection, getCountryStats],
  getDatabaseInfo: [ensureDBConnection, getDatabaseInfo],
};
