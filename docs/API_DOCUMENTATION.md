# Airport Database REST API Documentation

The Airport Database REST API provides comprehensive access to the EU airports database through RESTful endpoints. All endpoints return JSON responses with a consistent structure.

## Base URL
```
http://localhost:3002/api/v1/airports
```

## Response Format
All API responses follow this structure:

```json
{
  "code": 0,              // 0 = success, 1 = error
  "message": "string",    // Human-readable message
  "data": {...}           // Response data (varies by endpoint)
}
```

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

## Rate Limiting
No rate limiting is currently implemented.

## Endpoints

### 1. Get Database Information
**GET** `/info`

Returns general information about the database and available endpoints.

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/info"
```

**Example Response:**
```json
{
  "code": 0,
  "message": "Database information retrieved successfully",
  "data": {
    "name": "EU Airports Database",
    "description": "Comprehensive database of European airports",
    "totalRecords": 12228,
    "uniqueCountries": 52,
    "largeAirports": 118,
    "scheduledServiceAirports": 659,
    "availableTypes": ["large_airport", "medium_airport", "small_airport", "heliport", "seaplane_base", "balloonport", "closed"]
  }
}
```

### 2. Search Airports
**GET** `/search?q={searchTerm}&limit={limit}`

Search airports by name, ICAO code, IATA code, or municipality.

**Parameters:**
- `q` (required): Search term
- `limit` (optional): Maximum results (default: 20, max: 100)

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/search?q=London&limit=5"
```

**Example Response:**
```json
{
  "code": 0,
  "message": "Search completed successfully",
  "data": {
    "searchTerm": "London",
    "count": 5,
    "limit": 5,
    "airports": [
      {
        "id": 2434,
        "ident": "EGLL",
        "name": "London Heathrow Airport",
        "municipality": "London",
        "country_name": "United Kingdom",
        "icao_code": "EGLL",
        "iata_code": "LHR",
        "type": "large_airport"
      }
    ]
  }
}
```

### 3. Get Airports by Country
**GET** `/country/{countryCode}?limit={limit}&type={type}`

Get airports for a specific country using ISO 2-letter country code.

**Parameters:**
- `countryCode` (required): 2-letter ISO country code (e.g., GB, DE, FR)
- `limit` (optional): Maximum results (default: 50)
- `type` (optional): Filter by airport type

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/country/GB?type=large_airport&limit=5"
```

### 4. Get Airport by ICAO Code
**GET** `/icao/{icaoCode}`

Get detailed information for a specific airport using its ICAO code.

**Parameters:**
- `icaoCode` (required): 4-letter ICAO code (e.g., EGLL, LFPG)

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/icao/EGLL"
```

**Example Response:**
```json
{
  "code": 0,
  "message": "Airport retrieved successfully",
  "data": {
    "airport": {
      "id": 2434,
      "ident": "EGLL",
      "type": "large_airport",
      "name": "London Heathrow Airport",
      "latitude_deg": 51.4706,
      "longitude_deg": -0.461941,
      "elevation_ft": 83,
      "continent": "EU",
      "country_name": "United Kingdom",
      "iso_country": "GB",
      "municipality": "London",
      "scheduled_service": 1,
      "icao_code": "EGLL",
      "iata_code": "LHR",
      "home_link": "http://www.heathrowairport.com/",
      "wikipedia_link": "https://en.wikipedia.org/wiki/Heathrow_Airport"
    }
  }
}
```

### 5. Get Airport by IATA Code
**GET** `/iata/{iataCode}`

Get detailed information for a specific airport using its IATA code.

**Parameters:**
- `iataCode` (required): 3-letter IATA code (e.g., LHR, CDG)

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/iata/CDG"
```

### 6. Get Airports by Type
**GET** `/type/{airportType}?limit={limit}`

Get airports of a specific type.

**Parameters:**
- `airportType` (required): One of: `large_airport`, `medium_airport`, `small_airport`, `heliport`, `seaplane_base`, `balloonport`, `closed`
- `limit` (optional): Maximum results (default: 50)

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/type/large_airport?limit=10"
```

### 7. Get Nearby Airports
**GET** `/nearby?lat={latitude}&lng={longitude}&radius={radius}&limit={limit}`

Find airports near specific coordinates.

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in degrees (default: 1.0)
- `limit` (optional): Maximum results (default: 20)

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=2.0&limit=5"
```

**Example Response:**
```json
{
  "code": 0,
  "message": "Nearby airports retrieved successfully",
  "data": {
    "center": {
      "latitude": 48.8566,
      "longitude": 2.3522
    },
    "radius": 2.0,
    "count": 5,
    "airports": [
      {
        "id": 43425,
        "name": "Lariboisière Hospital Heliport",
        "municipality": "Paris",
        "country_name": "France",
        "latitude_deg": 48.88262,
        "longitude_deg": 2.354472,
        "type": "heliport",
        "distance": 0.028
      }
    ]
  }
}
```

### 8. Get Country Statistics
**GET** `/stats/countries`

Get statistical information about airports by country.

**Example Request:**
```bash
curl "http://localhost:3002/api/v1/airports/stats/countries"
```

**Example Response:**
```json
{
  "code": 0,
  "message": "Country statistics retrieved successfully",
  "data": {
    "count": 52,
    "countries": [
      {
        "country_name": "France",
        "total_airports": 1751,
        "large_airports": 8,
        "scheduled_airports": 59
      }
    ]
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "code": 1,
  "message": "Error description",
  "error": "Technical error details (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (airport not found)
- `500` - Internal Server Error

### Common Error Cases

1. **Invalid ICAO Code**
```bash
curl "http://localhost:3002/api/v1/airports/icao/INVALID"
# Returns: 400 - "Valid 4-letter ICAO code is required"
```

2. **Invalid Coordinates**
```bash
curl "http://localhost:3002/api/v1/airports/nearby?lat=200&lng=300"
# Returns: 400 - "Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180"
```

3. **Missing Required Parameters**
```bash
curl "http://localhost:3002/api/v1/airports/search"
# Returns: 400 - "Search term (q) parameter is required"
```

4. **Airport Not Found**
```bash
curl "http://localhost:3002/api/v1/airports/icao/ZZZZ"
# Returns: 404 - "Airport with ICAO code ZZZZ not found"
```

## Data Fields

### Airport Object Fields
- `id`: Unique identifier
- `ident`: Airport identifier
- `type`: Airport type (large_airport, medium_airport, etc.)
- `name`: Full airport name
- `latitude_deg`: Latitude in decimal degrees
- `longitude_deg`: Longitude in decimal degrees
- `elevation_ft`: Elevation in feet
- `continent`: Continent code
- `country_name`: Full country name
- `iso_country`: ISO 2-letter country code
- `region_name`: Region/state name
- `municipality`: City/municipality
- `scheduled_service`: 1 if has scheduled service, 0 if not
- `icao_code`: 4-letter ICAO code (may be null)
- `iata_code`: 3-letter IATA code (may be null)
- `home_link`: Official website URL (may be null)
- `wikipedia_link`: Wikipedia URL (may be null)
- `keywords`: Search keywords (may be null)
- `score`: Popularity/importance score
- `last_updated`: Last update timestamp

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Search for airports
const searchResults = await axios.get('http://localhost:3002/api/v1/airports/search?q=Paris');

// Get specific airport
const airport = await axios.get('http://localhost:3002/api/v1/airports/icao/LFPG');

// Find nearby airports
const nearby = await axios.get('http://localhost:3002/api/v1/airports/nearby?lat=48.8566&lng=2.3522');
```

### cURL Examples
```bash
# Search airports
curl "http://localhost:3002/api/v1/airports/search?q=Frankfurt"

# Get German large airports
curl "http://localhost:3002/api/v1/airports/country/DE?type=large_airport"

# Get airport by code
curl "http://localhost:3002/api/v1/airports/icao/EDDF"

# Find airports near coordinates
curl "http://localhost:3002/api/v1/airports/nearby?lat=50.0303&lng=8.5611&radius=0.5"
```

## Notes

- All coordinate-based searches use a simplified distance calculation (Manhattan distance)
- The database contains 12,228 airports across 52 European countries
- Results are generally ordered by popularity/score (highest first)
- ICAO and IATA codes may be null for smaller airports
- Search is case-insensitive and supports partial matching