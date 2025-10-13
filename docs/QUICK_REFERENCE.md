# RunwayAPI Quick Reference 🚀

## 🔗 Base URL
```
http://localhost:3002
```

## 🎯 Most Used Endpoints

### Simple City Search (Mobile-Friendly)
```bash
GET /api/v1/airports/city?q=London&format=simple&limit=5
```
**Response**: `[{icao_code, city, country}]` - 70% smaller than full format

### Fuzzy Search with Typo Tolerance
```bash  
GET /api/v1/airports/fuzzy?q=EGKL&details=true&limit=3
```
**Handles**: EGKL → EGLL, Frankfrt → Frankfurt, LFGP → LFPG

### Get Specific Airport
```bash
GET /api/v1/airports/icao/EGLL
```

### Find Nearby Airports
```bash
GET /api/v1/airports/nearby?lat=51.5074&lng=-0.1278&radius=0.5&limit=5
```

## 📊 Response Format

### Success (code: 0)
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "airports": [...],
    "count": 5,
    "limit": 10
  }
}
```

### Error (code: 1)
```json
{
  "code": 1,
  "message": "Error description",
  "error": "Bad Request"
}
```

## 🎛️ Key Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `format` | `simple`, `full` | Response size (simple = 70% smaller) |
| `fuzzy` | `true`, `false` | Enable typo tolerance |
| `limit` | `1-100` | Max results |
| `details` | `true`, `false` | Include fuzzy match scoring |

## 🔍 Search Capabilities

✅ **City Names**: London, Paris, Munich  
✅ **ICAO Codes**: EGLL, LFPG, EDDF  
✅ **Airport Names**: Heathrow, Charles de Gaulle  
✅ **Typo Tolerance**: Frankfrt → Frankfurt  
✅ **Character Swaps**: LFGP → LFPG  
✅ **Partial Matches**: EGL* → All UK airports starting with EGL

## ⚡ Quick JavaScript Example

```javascript
// Simple city search for mobile apps
const response = await fetch(
  'http://localhost:3002/api/v1/airports/city?q=London&format=simple&limit=3'
);
const data = await response.json();

if (data.code === 0) {
  data.data.airports.forEach(airport => {
    console.log(`${airport.icao_code} - ${airport.city}, ${airport.country}`);
  });
}
```

## 🐍 Quick Python Example

```python
import requests

def search_airports(city, limit=5):
    url = f"http://localhost:3002/api/v1/airports/city"
    params = {"q": city, "format": "simple", "limit": limit, "fuzzy": "true"}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return data['data']['airports'] if data['code'] == 0 else []

# Usage
airports = search_airports("Munich", 3)
for airport in airports:
    print(f"{airport['icao_code']} - {airport['city']}, {airport['country']}")
```

## 🚀 Performance Tips

- **Use `format=simple`** for mobile apps (70% bandwidth savings)
- **Enable `fuzzy=true`** for better user experience  
- **Set appropriate `limit`** to balance speed vs completeness
- **Cache results** for repeated searches
- **Use city search** for user-friendly interfaces

## 📱 Mobile-First Endpoints

Perfect for apps with limited bandwidth:

```bash
# Lightweight city search
GET /api/v1/airports/city?q=Paris&format=simple&limit=3

# Airport suggestions for autocomplete  
GET /api/v1/airports/suggestions?q=LO&limit=5

# Nearby airports with simple format
GET /api/v1/airports/nearby?lat=48.8566&lng=2.3522&format=simple&limit=5
```

## 🔧 Testing

```bash
# Health check
curl "http://localhost:3002/api/v1/airports/info"

# Test fuzzy search
curl "http://localhost:3002/api/v1/airports/city?q=Frankfrt&fuzzy=true"

# Test simple format
curl "http://localhost:3002/api/v1/airports/search?q=London&format=simple&limit=2"
```

## 📦 Import Postman Collection

1. Download: `docs/RunwayAPI_Postman_Collection.json`
2. Postman → Import → File
3. Set `baseUrl` variable to your API URL
4. Run tests to validate setup

## 🎯 Common Use Cases

| Use Case | Endpoint | Parameters |
|----------|----------|------------|
| Mobile airport picker | `/airports/city` | `format=simple, fuzzy=true` |
| Search autocomplete | `/airports/suggestions` | `limit=8` |
| Airport details page | `/airports/icao/{code}` | - |
| Map integration | `/airports/nearby` | `lat, lng, radius` |
| Country browsing | `/airports/country/{code}` | `type=large_airport` |

## 📚 Full Documentation

- **Complete Guide**: `docs/INTEGRATION_GUIDE.md`
- **Fuzzy Search**: `docs/FUZZY_SEARCH_SUMMARY.md`  
- **Format Options**: `docs/SIMPLE_FORMAT_GUIDE.md`

---
**⚡ Start building in minutes!** 🛫