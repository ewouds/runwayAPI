# RunwayAPI Integration Guide 🛫

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL & Endpoints](#base-url--endpoints)
- [Response Format](#response-format)
- [Search Endpoints](#search-endpoints)
- [Airport Data Endpoints](#airport-data-endpoints)
- [Runway & Weather Endpoints](#runway--weather-endpoints)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [SDKs & Code Examples](#sdks--code-examples)
- [Postman Collection](#postman-collection)

## Getting Started

### Base URL

```
Production: https://your-domain.com
Development: http://localhost:3002
```

### Quick Test

```bash
curl "http://localhost:3002/api/v1/airports/info"
```

### Interactive Demo

Visit the web interface: `http://localhost:3002/demo`

## Authentication

**Current Version**: No authentication required  
**Future Versions**: API key authentication planned

```javascript
// Future API key usage (planned)
headers: {
  'X-API-Key': 'your-api-key',
  'Content-Type': 'application/json'
}
```

## Base URL & Endpoints

All API endpoints follow the pattern:

```
{BASE_URL}/api/v1/{category}/{action}
```

### Available Categories

- `airports` - Airport database operations
- `runway` - Runway data and weather

## Response Format

All responses follow a consistent JSON structure:

```json
{
  "code": 0,                    // 0 = success, 1 = error
  "message": "string",          // Human-readable message
  "data": {                     // Response payload (success only)
    "query": "search term",     // Original search query
    "count": 5,                 // Number of results
    "limit": 10,                // Applied result limit
    "format": "simple",         // Response format used
    "airports": [...]           // Result array
  }
}
```

### Success Response (`code: 0`)

```json
{
  "code": 0,
  "message": "Search completed successfully",
  "data": {
    "airports": [
      {
        "icao_code": "EGLL",
        "name": "London Heathrow Airport",
        "municipality": "London",
        "country_name": "United Kingdom"
      }
    ]
  }
}
```

### Error Response (`code: 1`)

```json
{
  "code": 1,
  "message": "Search term (q) parameter is required",
  "error": "Bad Request"
}
```

## Search Endpoints

### 1. Basic Airport Search

Search across all airport fields with optional fuzzy matching.

```http
GET /api/v1/airports/search
```

**Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `q` | string | Yes | - | Search term (airport name, city, code) | | `limit` | integer | No | 20 | Maximum results (1-100) | | `fuzzy` | boolean | No | true | Enable fuzzy matching | | `format` | string | No | full | Response format (`simple`, `full`) |

**Examples:**

```bash
# Basic search
curl "http://localhost:3002/api/v1/airports/search?q=London&limit=5"

# Exact matching only
curl "http://localhost:3002/api/v1/airports/search?q=Heathrow&fuzzy=false"

# Simple format
curl "http://localhost:3002/api/v1/airports/search?q=Paris&format=simple"
```

### 2. Fuzzy Search with Scoring

Advanced fuzzy search with detailed match scoring and explanations.

```http
GET /api/v1/airports/fuzzy
```

**Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `q` | string | Yes | - | Search term | | `limit` | integer | No | 20 | Maximum results (1-100) | | `details` | boolean | No | false | Include match details and scoring | | `format` | string | No | full | Response format (`simple`, `full`) |

**Examples:**

```bash
# Fuzzy search with scoring details
curl "http://localhost:3002/api/v1/airports/fuzzy?q=EGKL&details=true&limit=5"

# Handle typos in airport codes
curl "http://localhost:3002/api/v1/airports/fuzzy?q=LFGP&limit=3"
```

**Response with Scoring:**

```json
{
  "code": 0,
  "data": {
    "airports": [
      {
        "icao_code": "LFPG",
        "name": "Charles de Gaulle International Airport",
        "municipality": "Paris (Roissy-en-France, Val-d'Oise)",
        "country_name": "France",
        "fuzzyScore": 96,
        "matchDetails": {
          "matches": ["ICAO fuzzy match (93.3%)", "Likely character transposition"]
        }
      }
    ]
  }
}
```

### 3. City-Based Search

Search airports by city/municipality name with advanced fuzzy matching.

```http
GET /api/v1/airports/city
```

**Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `q` | string | Yes | - | City name | | `limit` | integer | No | 20 | Maximum results (1-100) | | `fuzzy` | boolean | No | true | Enable fuzzy matching | | `format` | string | No | full | Response format (`simple`, `full`) |

**Examples:**

```bash
# Search by city name
curl "http://localhost:3002/api/v1/airports/city?q=Munich&limit=5"

# Handle city name typos
curl "http://localhost:3002/api/v1/airports/city?q=Frankfrt&fuzzy=true"

# Simple format for mobile apps
curl "http://localhost:3002/api/v1/airports/city?q=London&format=simple&limit=3"
```

### 4. Smart ICAO Search

ICAO-code specific fuzzy search optimized for aviation codes.

```http
GET /api/v1/airports/smart-icao
```

**Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `q` | string | Yes | - | ICAO code (or partial) | | `limit` | integer | No | 10 | Maximum results (1-50) |

**Examples:**

```bash
# Smart ICAO matching
curl "http://localhost:3002/api/v1/airports/smart-icao?q=EGKL&limit=5"

# Partial ICAO search
curl "http://localhost:3002/api/v1/airports/smart-icao?q=EGL&limit=10"
```

### 5. Search Suggestions

Get autocomplete suggestions for search interfaces.

```http
GET /api/v1/airports/suggestions
```

**Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `q` | string | Yes | - | Partial search term (min 2 chars) | | `limit` | integer | No | 10 | Maximum suggestions (1-20) |

**Examples:**

```bash
# Get suggestions for autocomplete
curl "http://localhost:3002/api/v1/airports/suggestions?q=EG&limit=8"
```

## Airport Data Endpoints

### 1. Get Airport by ICAO Code

Retrieve detailed information for a specific airport using ICAO code.

```http
GET /api/v1/airports/icao/{icao_code}
```

**Path Parameters:** | Parameter | Type | Required | Description | |-----------|------|----------|-------------| | `icao_code` | string | Yes | 4-letter ICAO code (e.g., EGLL) |

**Examples:**

```bash
# Get Heathrow details
curl "http://localhost:3002/api/v1/airports/icao/EGLL"

# Get Frankfurt details
curl "http://localhost:3002/api/v1/airports/icao/EDDF"
```

### 2. Get Airport by IATA Code

Retrieve airport information using IATA code.

```http
GET /api/v1/airports/iata/{iata_code}
```

**Path Parameters:** | Parameter | Type | Required | Description | |-----------|------|----------|-------------| | `iata_code` | string | Yes | 3-letter IATA code (e.g., LHR) |

**Examples:**

```bash
# Get airport by IATA
curl "http://localhost:3002/api/v1/airports/iata/LHR"
curl "http://localhost:3002/api/v1/airports/iata/MUC"
```

### 3. Get Airports by Country

List airports in a specific country.

```http
GET /api/v1/airports/country/{country_code}
```

**Path Parameters:** | Parameter | Type | Required | Description | |-----------|------|----------|-------------| | `country_code` | string | Yes | 2-letter ISO country code (e.g., DE, FR, UK) |

**Query Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `limit` | integer | No | 50 | Maximum results (1-200) | | `type` | string | No | - | Filter by airport type |

**Airport Types:**

- `large_airport` - Major commercial airports
- `medium_airport` - Regional airports
- `small_airport` - Local airports
- `heliport` - Helicopter facilities
- `seaplane_base` - Seaplane facilities

**Examples:**

```bash
# All German airports (limited)
curl "http://localhost:3002/api/v1/airports/country/DE?limit=20"

# Large UK airports only
curl "http://localhost:3002/api/v1/airports/country/GB?type=large_airport&limit=10"

# French airports
curl "http://localhost:3002/api/v1/airports/country/FR?limit=15"
```

### 4. Get Airports by Type

Filter airports by facility type.

```http
GET /api/v1/airports/type/{airport_type}
```

**Path Parameters:** | Parameter | Type | Required | Description | |-----------|------|----------|-------------| | `airport_type` | string | Yes | Airport type (see types above) |

**Query Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `limit` | integer | No | 50 | Maximum results (1-200) |

**Examples:**

```bash
# Large airports in Europe
curl "http://localhost:3002/api/v1/airports/type/large_airport?limit=20"

# Heliports
curl "http://localhost:3002/api/v1/airports/type/heliport?limit=10"
```

### 5. Get Nearby Airports

Find airports within a specified radius of coordinates.

```http
GET /api/v1/airports/nearby
```

**Query Parameters:** | Parameter | Type | Required | Default | Description | |-----------|------|----------|---------|-------------| | `lat` | float | Yes | - | Latitude (-90 to 90) | | `lng` | float | Yes | - | Longitude (-180 to 180) | | `radius` | float | No | 1.0 | Search radius in degrees | | `limit` | integer | No | 20 | Maximum results (1-100) |

**Examples:**

```bash
# Airports near Paris
curl "http://localhost:3002/api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=1.0&limit=10"

# Airports near London
curl "http://localhost:3002/api/v1/airports/nearby?lat=51.5074&lng=-0.1278&radius=0.5&limit=5"
```

### 6. Database Statistics

Get comprehensive database statistics.

```http
GET /api/v1/airports/stats/countries
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "countries": [
      {
        "country_name": "France",
        "country_code": "FR",
        "total_airports": 1751,
        "large_airports": 12,
        "medium_airports": 45,
        "scheduled_airports": 89
      }
    ]
  }
}
```

### 7. Database Information

Get general database metadata and capabilities.

```http
GET /api/v1/airports/info
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "name": "EU Airports Database",
    "totalRecords": 12228,
    "uniqueCountries": 52,
    "largeAirports": 118,
    "fuzzySearchFeatures": ["Typo tolerance (Levenshtein distance)", "Phonetic matching (Soundex)", "Character transposition detection"],
    "endpoints": {
      "search": "/api/v1/airports/search?q=searchTerm",
      "city": "/api/v1/airports/city?q=cityName",
      "fuzzy": "/api/v1/airports/fuzzy?q=searchTerm"
    }
  }
}
```

## Runway & Weather Endpoints

### Get Runway Data with Weather

Retrieve runway information and current METAR weather data.

```http
GET /api/v1/runway/{icao_code}
```

**Path Parameters:** | Parameter | Type | Required | Description | |-----------|------|----------|-------------| | `icao_code` | string | Yes | 4-letter ICAO airport code |

**Examples:**

```bash
# Heathrow runway and weather
curl "http://localhost:3002/api/v1/runway/EGLL"

# Frankfurt runway and weather
curl "http://localhost:3002/api/v1/runway/EDDF"
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "airport": "EGLL",
    "runway": {
      "runway_ident": "09L/27R",
      "length_ft": 12799,
      "width_ft": 150,
      "surface": "ASP",
      "lighted": true
    },
    "weather": {
      "station": "EGLL",
      "wind": {
        "direction": 270,
        "speed": 8,
        "unit": "KT"
      },
      "visibility": 10,
      "temperature": 15,
      "pressure": {
        "value": 1015,
        "unit": "hPa"
      }
    }
  }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (airport/resource not found)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "code": 1,
  "message": "Search term (q) parameter is required",
  "error": "Bad Request"
}
```

### Common Error Messages

| Message                                       | Cause                 | Solution                                 |
| --------------------------------------------- | --------------------- | ---------------------------------------- |
| "Search term (q) parameter is required"       | Missing `q` parameter | Add `?q=searchterm`                      |
| "Query must be at least 2 characters"         | Query too short       | Use minimum 2 characters                 |
| "Valid 2-letter country ISO code is required" | Invalid country code  | Use ISO codes like DE, FR, GB            |
| "Invalid airport type"                        | Wrong airport type    | Use: large_airport, medium_airport, etc. |

## Rate Limits

**Current**: No rate limiting  
**Planned**: 1000 requests/hour per IP

**Headers (future):**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

## SDKs & Code Examples

### JavaScript/Node.js

#### Basic Usage

```javascript
const axios = require("axios");

class RunwayAPI {
  constructor(baseURL = "http://localhost:3002") {
    this.baseURL = baseURL;
  }

  async searchAirports(query, options = {}) {
    const { limit = 20, fuzzy = true, format = "full" } = options;

    try {
      const response = await axios.get(`${this.baseURL}/api/v1/airports/search`, {
        params: { q: query, limit, fuzzy, format },
      });

      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async searchByCity(city, options = {}) {
    const { limit = 20, format = "simple" } = options;

    const response = await axios.get(`${this.baseURL}/api/v1/airports/city`, {
      params: { q: city, limit, format, fuzzy: true },
    });

    return response.data;
  }

  async getAirportByICAO(icaoCode) {
    const response = await axios.get(`${this.baseURL}/api/v1/airports/icao/${icaoCode}`);
    return response.data;
  }

  async getNearbyAirports(lat, lng, radius = 1.0, limit = 20) {
    const response = await axios.get(`${this.baseURL}/api/v1/airports/nearby`, {
      params: { lat, lng, radius, limit },
    });
    return response.data;
  }
}

// Usage example
const api = new RunwayAPI();

async function example() {
  // Search for London airports
  const londonAirports = await api.searchByCity("London", { limit: 5, format: "simple" });
  console.log(londonAirports.data.airports);

  // Get specific airport
  const heathrow = await api.getAirportByICAO("EGLL");
  console.log(heathrow.data);

  // Find nearby airports
  const nearParis = await api.getNearbyAirports(48.8566, 2.3522, 1.0, 10);
  console.log(nearParis.data.airports);
}
```

#### React Hook

```javascript
import { useState, useEffect } from "react";
import axios from "axios";

export function useAirportSearch(query, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) return;

    setLoading(true);
    setError(null);

    const searchAirports = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/v1/airports/city", {
          params: {
            q: query,
            limit: options.limit || 10,
            format: options.format || "simple",
            fuzzy: true,
          },
        });

        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAirports, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, options.limit, options.format]);

  return { data, loading, error };
}

// Usage in component
function AirportSearchComponent() {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useAirportSearch(query, { limit: 5, format: "simple" });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search airports...' />

      {loading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}

      {data?.data?.airports?.map((airport) => (
        <div key={airport.icao_code}>
          {airport.icao_code} - {airport.city}, {airport.country}
        </div>
      ))}
    </div>
  );
}
```

### Python

```python
import requests
from typing import List, Dict, Optional

class RunwayAPI:
    def __init__(self, base_url: str = "http://localhost:3002"):
        self.base_url = base_url
        self.session = requests.Session()

    def search_airports(self, query: str, limit: int = 20,
                       fuzzy: bool = True, format: str = "full") -> Dict:
        """Search airports with fuzzy matching"""
        params = {
            'q': query,
            'limit': limit,
            'fuzzy': str(fuzzy).lower(),
            'format': format
        }

        response = self.session.get(
            f"{self.base_url}/api/v1/airports/search",
            params=params
        )
        response.raise_for_status()
        return response.json()

    def search_by_city(self, city: str, limit: int = 20,
                      format: str = "simple") -> List[Dict]:
        """Search airports by city name"""
        params = {
            'q': city,
            'limit': limit,
            'format': format,
            'fuzzy': 'true'
        }

        response = self.session.get(
            f"{self.base_url}/api/v1/airports/city",
            params=params
        )
        response.raise_for_status()

        data = response.json()
        return data['data']['airports'] if data['code'] == 0 else []

    def get_airport_by_icao(self, icao_code: str) -> Optional[Dict]:
        """Get airport details by ICAO code"""
        response = self.session.get(
            f"{self.base_url}/api/v1/airports/icao/{icao_code}"
        )
        response.raise_for_status()

        data = response.json()
        return data['data'] if data['code'] == 0 else None

    def get_nearby_airports(self, lat: float, lng: float,
                           radius: float = 1.0, limit: int = 20) -> List[Dict]:
        """Find airports near coordinates"""
        params = {
            'lat': lat,
            'lng': lng,
            'radius': radius,
            'limit': limit
        }

        response = self.session.get(
            f"{self.base_url}/api/v1/airports/nearby",
            params=params
        )
        response.raise_for_status()

        data = response.json()
        return data['data']['airports'] if data['code'] == 0 else []

# Usage example
if __name__ == "__main__":
    api = RunwayAPI()

    # Search for airports in London
    london_airports = api.search_by_city("London", limit=5)
    for airport in london_airports:
        print(f"{airport['icao_code']} - {airport['city']}, {airport['country']}")

    # Get specific airport
    heathrow = api.get_airport_by_icao("EGLL")
    if heathrow:
        print(f"Heathrow: {heathrow['name']} at {heathrow['municipality']}")

    # Find airports near Paris
    near_paris = api.get_nearby_airports(48.8566, 2.3522, radius=1.0, limit=10)
    print(f"Found {len(near_paris)} airports near Paris")
```

### PHP

```php
<?php

class RunwayAPI {
    private $baseUrl;

    public function __construct($baseUrl = 'http://localhost:3002') {
        $this->baseUrl = $baseUrl;
    }

    public function searchAirports($query, $options = []) {
        $params = array_merge([
            'q' => $query,
            'limit' => 20,
            'fuzzy' => 'true',
            'format' => 'full'
        ], $options);

        $url = $this->baseUrl . '/api/v1/airports/search?' . http_build_query($params);

        $response = file_get_contents($url);
        if ($response === false) {
            throw new Exception('Failed to fetch data from API');
        }

        return json_decode($response, true);
    }

    public function searchByCity($city, $limit = 20, $format = 'simple') {
        $params = [
            'q' => $city,
            'limit' => $limit,
            'format' => $format,
            'fuzzy' => 'true'
        ];

        $url = $this->baseUrl . '/api/v1/airports/city?' . http_build_query($params);

        $response = file_get_contents($url);
        $data = json_decode($response, true);

        return ($data['code'] === 0) ? $data['data']['airports'] : [];
    }

    public function getAirportByICAO($icaoCode) {
        $url = $this->baseUrl . '/api/v1/airports/icao/' . urlencode($icaoCode);

        $response = file_get_contents($url);
        $data = json_decode($response, true);

        return ($data['code'] === 0) ? $data['data'] : null;
    }
}

// Usage example
$api = new RunwayAPI();

// Search for London airports
$londonAirports = $api->searchByCity('London', 5);
foreach ($londonAirports as $airport) {
    echo $airport['icao_code'] . ' - ' . $airport['city'] . ', ' . $airport['country'] . "\n";
}

// Get specific airport
$heathrow = $api->getAirportByICAO('EGLL');
if ($heathrow) {
    echo "Heathrow: " . $heathrow['name'] . " at " . $heathrow['municipality'] . "\n";
}
?>
```

## Postman Collection

### Collection Structure

```json
{
  "info": {
    "name": "RunwayAPI",
    "description": "European Airports API with Fuzzy Search"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3002"
    }
  ],
  "item": [
    {
      "name": "Search Endpoints",
      "item": [
        {
          "name": "Basic Search",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/v1/airports/search?q=London&limit=5&format=simple"
          }
        },
        {
          "name": "Fuzzy Search with Details",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/v1/airports/fuzzy?q=EGKL&details=true&limit=5"
          }
        },
        {
          "name": "City Search",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/v1/airports/city?q=Munich&format=simple&limit=3"
          }
        }
      ]
    }
  ]
}
```

### Import to Postman

1. Copy the JSON above
2. Open Postman → Import → Raw Text
3. Paste and import
4. Set environment variable `baseUrl` to your API URL

## Testing & Validation

### Health Check

```bash
curl "http://localhost:3002/api/v1/airports/info"
```

### Full Integration Test

```bash
# Run comprehensive test suite
npm run test:api

# Or manual testing
curl "http://localhost:3002/api/v1/airports/city?q=London&format=simple&limit=3"
```

### Expected Response Time

- Simple queries: < 50ms
- Complex fuzzy searches: < 200ms
- Nearby searches: < 100ms

## Support & Resources

### Interactive Demo

- Web Interface: `http://localhost:3002/demo`
- Test all endpoints with real-time results

### Documentation

- API Guide: `/docs/API_DOCUMENTATION.md`
- Fuzzy Search Guide: `/docs/FUZZY_SEARCH_SUMMARY.md`
- Format Guide: `/docs/SIMPLE_FORMAT_GUIDE.md`

### Community

- GitHub Issues: For bug reports
- GitHub Discussions: For questions and feature requests
- Documentation: Comprehensive guides in `/docs` folder

---

**Built for developers, by developers** ✈️  
_Happy integrating!_ 🚁
