/**
 * SQLite Database Interface for EU Airports
 * Provides methods to query the converted airports database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const FuzzySearch = require('../helpers/fuzzySearch.cjs');

class AirportsDB {
    constructor(dbPath = './airportDB/eu-airports.db') {
        this.dbPath = path.resolve(dbPath);
        this.db = null;
        this.fuzzySearch = new FuzzySearch();
        this.airportCache = null; // Cache for fuzzy search
        this.cacheExpiry = null;
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Open database connection
     */
    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to the SQLite database.');
                    resolve();
                }
            });
        });
    }

    /**
     * Close database connection
     */
    async close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log('Database connection closed.');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Get all airports for a specific country
     */
    async getAirportsByCountry(countryCode, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, ident, name, municipality, icao_code, iata_code, type, 
                       latitude_deg, longitude_deg, elevation_ft, scheduled_service
                FROM airports 
                WHERE iso_country = ? 
                ORDER BY score DESC
                LIMIT ?
            `;
            
            this.db.all(sql, [countryCode, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Search airports by name or code
     */
    async searchAirports(searchTerm, limit = 20) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, ident, name, municipality, country_name, icao_code, iata_code, type
                FROM airports 
                WHERE name LIKE ? OR icao_code LIKE ? OR iata_code LIKE ? OR municipality LIKE ?
                ORDER BY score DESC
                LIMIT ?
            `;
            
            const searchPattern = `%${searchTerm}%`;
            
            this.db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get airports by type (large_airport, medium_airport, etc.)
     */
    async getAirportsByType(type, limit = 50) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, ident, name, municipality, country_name, icao_code, iata_code,
                       latitude_deg, longitude_deg, scheduled_service
                FROM airports 
                WHERE type = ?
                ORDER BY score DESC
                LIMIT ?
            `;
            
            this.db.all(sql, [type, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get airports within a geographical radius (simplified calculation)
     */
    async getAirportsNearby(latitude, longitude, radiusDegrees = 1.0, limit = 20) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, ident, name, municipality, country_name, icao_code, iata_code,
                       latitude_deg, longitude_deg, type, scheduled_service,
                       ABS(latitude_deg - ?) + ABS(longitude_deg - ?) as distance
                FROM airports 
                WHERE latitude_deg IS NOT NULL 
                  AND longitude_deg IS NOT NULL
                  AND ABS(latitude_deg - ?) <= ?
                  AND ABS(longitude_deg - ?) <= ?
                ORDER BY distance ASC
                LIMIT ?
            `;
            
            this.db.all(sql, [latitude, longitude, latitude, radiusDegrees, longitude, radiusDegrees, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get airport statistics by country
     */
    async getCountryStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    country_name,
                    COUNT(*) as total_airports,
                    COUNT(CASE WHEN type = 'large_airport' THEN 1 END) as large_airports,
                    COUNT(CASE WHEN scheduled_service = 1 THEN 1 END) as scheduled_airports
                FROM airports 
                GROUP BY country_name 
                ORDER BY total_airports DESC
                LIMIT 20
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get airport by ICAO code
     */
    async getAirportByICAO(icaoCode) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM airports WHERE icao_code = ?
            `;
            
            this.db.get(sql, [icaoCode], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get airport by IATA code
     */
    async getAirportByIATA(iataCode) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM airports WHERE iata_code = ?
            `;
            
            this.db.get(sql, [iataCode], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Load all airports into cache for fuzzy search
     */
    async loadAirportsCache() {
        if (this.airportCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
            return this.airportCache;
        }

        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, ident, name, municipality, country_name, icao_code, iata_code, 
                       type, latitude_deg, longitude_deg, elevation_ft, scheduled_service, keywords
                FROM airports 
                ORDER BY score DESC
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    this.airportCache = rows;
                    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Perform fuzzy search on airports
     */
    async fuzzySearchAirports(query, options = {}) {
        const {
            limit = 20,
            minScore = 15,
            includeDetails = false
        } = options;

        try {
            const airports = await this.loadAirportsCache();
            const results = this.fuzzySearch.fuzzySearch(airports, query, {
                limit,
                minScore,
                includeDetails
            });

            return results.map(result => ({
                ...result.airport,
                fuzzyScore: result.score,
                matchDetails: result.details
            }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get search suggestions for autocomplete
     */
    async getSearchSuggestions(query, limit = 10) {
        try {
            const airports = await this.loadAirportsCache();
            return this.fuzzySearch.getSuggestions(airports, query, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Enhanced search that combines exact matching with fuzzy search
     */
    async enhancedSearch(query, limit = 20) {
        try {
            // First try exact/prefix matching (faster)
            const exactResults = await this.searchAirports(query, Math.floor(limit / 2));
            
            // Then add fuzzy results if we need more
            const fuzzyResults = await this.fuzzySearchAirports(query, {
                limit: limit - exactResults.length,
                minScore: 20
            });

            // Combine and deduplicate results
            const combinedResults = [...exactResults];
            const existingIds = new Set(exactResults.map(a => a.id));

            for (const fuzzyResult of fuzzyResults) {
                if (!existingIds.has(fuzzyResult.id)) {
                    combinedResults.push(fuzzyResult);
                    existingIds.add(fuzzyResult.id);
                }
            }

            return combinedResults.slice(0, limit);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Smart ICAO code search with typo tolerance
     */
    async smartICAOSearch(query, limit = 10) {
        if (!query || query.length < 3) {
            return [];
        }

        try {
            const airports = await this.loadAirportsCache();
            const icaoQuery = query.toUpperCase();
            
            // Filter to only airports with ICAO codes and prioritize exact/close matches
            const icaoAirports = airports.filter(a => a.icao_code);
            
            const results = this.fuzzySearch.fuzzySearch(icaoAirports, icaoQuery, {
                limit,
                minScore: 30, // Higher threshold for ICAO-specific search
                includeDetails: true
            });

            return results.map(result => ({
                icao_code: result.airport.icao_code,
                iata_code: result.airport.iata_code,
                name: result.airport.name,
                municipality: result.airport.municipality,
                country_name: result.airport.country_name,
                type: result.airport.type,
                score: result.score,
                matchReason: result.details.matches.join(', ')
            }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Search airports by city/municipality name (exact matching)
     */
    async searchAirportsByCity(cityName, limit = 20) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const query = `
                SELECT * FROM airports 
                WHERE municipality LIKE ? 
                ORDER BY 
                    CASE 
                        WHEN municipality = ? THEN 1
                        WHEN municipality LIKE ? THEN 2
                        ELSE 3
                    END,
                    name
                LIMIT ?
            `;
            
            const cityPattern = `%${cityName}%`;
            const cityExact = cityName;
            const cityPrefix = `${cityName}%`;
            
            return await this.all(query, [cityPattern, cityExact, cityPrefix, limit]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fuzzy search airports by city/municipality name with enhanced city matching
     */
    async fuzzyCitySearch(cityName, options = {}) {
        const { limit = 20, includeDetails = false } = options;
        
        if (!cityName || cityName.length < 2) {
            return [];
        }

        try {
            const airports = await this.loadAirportsCache();
            
            // Filter airports that have municipality data
            const cityAirports = airports.filter(a => a.municipality && a.municipality.trim());
            
            // Use fuzzy search with city-focused scoring
            const results = this.fuzzySearch.fuzzySearch(cityAirports, cityName, {
                limit,
                minScore: 15, // Lower threshold for city names
                includeDetails
            });

            // Sort results prioritizing city matches
            return results.sort((a, b) => {
                // Prioritize exact city matches
                const aCityExact = a.airport.municipality && 
                    a.airport.municipality.toLowerCase() === cityName.toLowerCase();
                const bCityExact = b.airport.municipality && 
                    b.airport.municipality.toLowerCase() === cityName.toLowerCase();
                
                if (aCityExact && !bCityExact) return -1;
                if (!aCityExact && bCityExact) return 1;
                
                // Then prioritize city starts with query
                const aCityStarts = a.airport.municipality && 
                    a.airport.municipality.toLowerCase().startsWith(cityName.toLowerCase());
                const bCityStarts = b.airport.municipality && 
                    b.airport.municipality.toLowerCase().startsWith(cityName.toLowerCase());
                
                if (aCityStarts && !bCityStarts) return -1;
                if (!aCityStarts && bCityStarts) return 1;
                
                // Finally by fuzzy score
                return b.score - a.score;
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AirportsDB;