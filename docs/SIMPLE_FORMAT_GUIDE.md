# Simple Format Parameter - Documentation & Examples

## Overview
The RunwayAPI now supports a `format=simple` parameter that returns a clean, simplified JSON response containing only:
- **icao_code**: The ICAO airport code
- **city**: The municipality/city name  
- **country**: The country name

## Supported Endpoints

### 1. City Search Endpoint
```
GET /api/v1/airports/city?q=cityName&limit=20&fuzzy=true&format=simple
```

### 2. Fuzzy Search Endpoint  
```
GET /api/v1/airports/fuzzy?q=searchTerm&limit=20&format=simple
```

## Examples

### Example 1: London Airports (Simple Format)
```bash
curl "http://localhost:3002/api/v1/airports/city?q=London&limit=3&format=simple"
```

**Response:**
```json
{
  "code": 0,
  "message": "City search completed successfully",
  "data": {
    "query": "London",
    "fuzzyEnabled": true,
    "format": "simple",
    "count": 3,
    "limit": 3,
    "airports": [
      {
        "icao_code": "EGLL",
        "city": "London",
        "country": "United Kingdom"
      },
      {
        "icao_code": "EGKK", 
        "city": "London",
        "country": "United Kingdom"
      },
      {
        "icao_code": "EGGW",
        "city": "Luton, Bedfordshire", 
        "country": "United Kingdom"
      }
    ]
  }
}
```

### Example 2: City Search with Typo (Parris → Paris)
```bash
curl "http://localhost:3002/api/v1/airports/fuzzy?q=Parris&limit=3&format=simple"
```

**Response:**
```json
{
  "code": 0,
  "message": "Fuzzy search completed successfully",
  "data": {
    "searchTerm": "Parris",
    "searchType": "fuzzy",
    "format": "simple",
    "count": 3,
    "limit": 3,
    "airports": [
      {
        "icao_code": "LGPA",
        "city": "Paros",
        "country": "Greece"
      },
      {
        "icao_code": "LFPB",
        "city": "Paris",
        "country": "France"
      },
      {
        "icao_code": "LFPO",
        "city": "Paris (Orly, Val-de-Marne)",
        "country": "France"
      }
    ]
  }
}
```

### Example 3: Frankfurt with Typo (Frankfrt → Frankfurt)
```bash
curl "http://localhost:3002/api/v1/airports/city?q=Frankfrt&limit=3&format=simple"
```

**Response:**
```json
{
  "code": 0,
  "message": "City search completed successfully", 
  "data": {
    "query": "Frankfrt",
    "fuzzyEnabled": true,
    "format": "simple",
    "count": 2,
    "limit": 3,
    "airports": [
      {
        "icao_code": "EDDF",
        "city": "Frankfurt am Main",
        "country": "Germany"
      },
      {
        "icao_code": "LFRN", 
        "city": "Saint-Jacques-de-la-Lande, Ille-et-Vilaine",
        "country": "France"
      }
    ]
  }
}
```

## Comparison: Simple vs Full Format

### Simple Format (`format=simple`)
- ✅ Clean, minimal response
- ✅ Only essential data (ICAO, city, country)
- ✅ Perfect for dropdowns, autocomplete, simple lists
- ✅ Reduced bandwidth usage
- ✅ Filters out airports without ICAO codes

### Full Format (`format=full` or default)
- ✅ Complete airport information  
- ✅ Fuzzy search scores and match details
- ✅ All available fields (name, coordinates, type, etc.)
- ✅ Useful for detailed analysis
- ✅ Debugging and development

## Integration Tips

### JavaScript Frontend Example
```javascript
async function searchAirportsByCity(cityName) {
    const response = await fetch(
        `http://localhost:3002/api/v1/airports/city?q=${encodeURIComponent(cityName)}&limit=10&format=simple`
    );
    const data = await response.json();
    
    if (data.code === 0) {
        return data.data.airports.map(airport => ({
            code: airport.icao_code,
            city: airport.city,
            country: airport.country
        }));
    }
    return [];
}
```

### Python Example
```python
import requests

def search_airports_simple(query, limit=10):
    url = f"http://localhost:3002/api/v1/airports/city"
    params = {
        'q': query,
        'limit': limit,
        'format': 'simple'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data['code'] == 0:
        return [(a['icao_code'], a['city'], a['country']) 
                for a in data['data']['airports']]
    return []
```

## Use Cases
- **Autocomplete dropdowns**: Clean city/airport selection
- **Mobile apps**: Reduced data usage
- **Data export**: Simple CSV-friendly format  
- **Integration**: Easy to parse and use in other systems
- **Dashboard widgets**: Lightweight airport lists

## Benefits
1. **Bandwidth Efficiency**: ~70% smaller response size
2. **Parse Simplicity**: No need to extract data from complex objects
3. **UI Friendly**: Perfect structure for dropdowns and lists
4. **Quality Filtering**: Only airports with ICAO codes and cities
5. **Consistent Structure**: Same format across all endpoints