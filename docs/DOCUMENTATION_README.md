# 📚 RunwayAPI Documentation & Testing

## 🚀 Quick Access

| Feature | URL | Description |
|---------|-----|-------------|
| **OpenAPI Docs** | http://localhost:3002/docs | 📖 Interactive Swagger UI documentation |
| **Test Application** | http://localhost:3002/test | 🧪 Comprehensive API testing interface |
| **Demo Page** | http://localhost:3002/demo | 🎮 Basic search demo |
| **API Spec** | http://localhost:3002/openapi.json | 📄 Raw OpenAPI specification |

## 📖 OpenAPI Documentation

**URL:** http://localhost:3002/docs

### Features:
- **Interactive Testing** - Try all endpoints directly in the browser
- **Complete API Reference** - All 13 endpoints with parameters, examples, and responses
- **Schema Documentation** - Detailed request/response models
- **Try It Out** - Execute real API calls with customizable parameters
- **Response Examples** - See what to expect from each endpoint

### Key Sections:
- 🔍 **Search Endpoints** - Fuzzy search, city search, ICAO search, suggestions
- 🏢 **Airport Data** - Get by ICAO/IATA, browse by country/type
- 📍 **Geographic** - Nearby airports, country statistics
- 🛫 **Runway & Weather** - Infrastructure and METAR data
- 📊 **Database** - Information and statistics

## 🧪 Test Application

**URL:** http://localhost:3002/test

### Features:
- **Comprehensive Testing** - All 13 endpoints with real-time testing
- **Quick Test Buttons** - Pre-filled examples for immediate testing
- **Response Visualization** - Beautiful cards showing airport data
- **Performance Metrics** - Response times and result counts
- **Fuzzy Match Scoring** - Detailed match explanations and scoring
- **Mobile Responsive** - Works on all devices

### Test Categories:

#### 🔍 Search Endpoints
- **Basic Search** - General airport search with format options
- **Fuzzy Search** - Typo handling with scoring details (EGKL → EGLL, LFGP → LFPG)
- **City Search** - City-specific search with typo tolerance
- **Smart ICAO** - Aviation code matching with partial support
- **Suggestions** - Autocomplete functionality

#### 🏢 Airport Data
- **By ICAO** - Get specific airports (EGLL, LFPG, EDDF)
- **By IATA** - Search using commercial codes (LHR, CDG, FRA)
- **By Country** - Browse airports by country with type filtering
- **By Type** - Filter by airport types (large, medium, heliports)

#### 📍 Geographic
- **Nearby Airports** - Location-based search with coordinates
- **Country Stats** - Database statistics by country  
- **Database Info** - Complete API and database information

#### 🛫 Runway & Weather
- **Runway Data** - Infrastructure information with real-time weather

### Quick Test Examples:
```
✈️ London airports (simple format)
✈️ Frankfurt with typo (Frankfrt → Frankfurt)  
✈️ ICAO transposition (LFGP → LFPG)
✈️ Partial ICAO (EGL* → All UK airports)
✈️ Airports near Paris coordinates
✈️ German large airports only
```

## 🛠️ NPM Scripts

```bash
# Start server with documentation
npm start                    # Starts server on port 3002

# Open documentation in browser
npm run docs                 # Opens http://localhost:3002/docs

# Open test application  
npm run test:app            # Opens http://localhost:3002/test

# Open demo page
npm run demo:web           # Opens http://localhost:3002/demo
```

## 🔗 Integration Examples

### Using the Interactive Docs
1. Visit http://localhost:3002/docs
2. Expand any endpoint section
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"
6. View response with timing

### Using the Test App
1. Visit http://localhost:3002/test
2. Choose a test category tab
3. Use quick test buttons or fill parameters
4. Click test button
5. View results in formatted cards

### Example API Calls from Docs:

#### Search London Airports (Simple Format)
```bash
GET /api/v1/airports/city?q=London&format=simple&limit=5
```

#### Test Fuzzy Search
```bash  
GET /api/v1/airports/fuzzy?q=EGKL&details=true&limit=3
```

#### Find Airports Near Paris
```bash
GET /api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=1.0&limit=10
```

## 📊 What You Can Test

### ✅ Fuzzy Search Capabilities
- **Typo Tolerance**: `Frankfrt` → `Frankfurt Airport`
- **Character Swaps**: `LFGP` → `Charles de Gaulle (LFPG)`  
- **Phonetic Matching**: `Myunikh` → `Munich Airport`
- **Partial Matching**: `EGL` → `All UK airports starting with EGL*`

### ✅ Response Formats
- **Simple Format**: 70-83% smaller, mobile-optimized `{icao_code, city, country}`
- **Full Format**: Complete airport data with coordinates, types, etc.
- **Fuzzy Scoring**: Match confidence and explanation details

### ✅ Geographic Features  
- **Radius Search**: Find airports within X degrees of coordinates
- **Country Filtering**: Browse by country with type filters
- **Location Data**: Precise coordinates for mapping integration

### ✅ Real-time Data
- **Weather Integration**: Current METAR data
- **Runway Information**: Infrastructure details
- **Database Stats**: Live statistics and capabilities

## 🎯 Perfect For Testing

- **API Integration** - Test before implementing
- **Mobile Development** - Compare simple vs full formats
- **Aviation Apps** - Test fuzzy search with real aviation codes  
- **Travel Platforms** - Test city-based search functionality
- **Mapping Services** - Test geographic search features
- **Performance Testing** - Monitor response times and data sizes

## 🚀 Next Steps

1. **Explore Interactive Docs**: http://localhost:3002/docs
2. **Try Test Application**: http://localhost:3002/test  
3. **Read Integration Guide**: `/docs/INTEGRATION_GUIDE.md`
4. **Import Postman Collection**: `/docs/RunwayAPI_Postman_Collection.json`
5. **Start Building** with the API endpoints that work best for your use case!

---

**Happy Testing!** 🛫✨