# RunwayAPI 🛫# Runway API Server

A comprehensive REST API for European airports featuring advanced fuzzy search, runway data, and METAR weather information. Built with Node.js and Express, this API provides intelligent search capabilities with typo tolerance and multiple output formats.A Node.js Express API server that provides comprehensive airport runway information combined with real-time weather data (METAR) for aviation applications.

## 🌟 Features## 🛫 Overview

### Core FunctionalityThe Runway API fetches and combines airport runway data from AirportDB with current weather information (METAR) from aviation weather services. It's designed to provide pilots and aviation applications with essential runway and weather information for flight planning and operations.

- **🗄️ Comprehensive Airport Database**: 12,228+ European airports across 52 countries

- **🔍 Advanced Fuzzy Search**: Typo-tolerant search with multiple algorithms## ✨ Features

- **🛫 Runway Information**: Detailed runway data with METAR weather integration

- **🏙️ City-Based Search**: Search airports by city/municipality with fuzzy matching- **Airport Runway Data**: Detailed runway information including dimensions, orientations, and ILS capabilities

- **📱 Multiple Output Formats**: Simple JSON format for mobile/lightweight apps- **Real-time Weather**: Current METAR data from multiple weather providers

- **Multiple Data Sources**: Support for AviationWeather.gov and VATSIM METAR providers

### Search Capabilities- **Data Validation**: Comprehensive validation of runway and weather data

- **Smart ICAO Matching**: Character transposition detection (EGKL → EGLL)- **Error Handling**: Robust error handling with meaningful error messages

- **Phonetic Similarity**: Soundex-based matching for similar-sounding codes- **CORS Support**: Configurable CORS for web applications

- **Name Fuzzy Matching**: Intelligent airport name search with typo tolerance- **Comprehensive Testing**: 37 tests with 80% code coverage

- **Geographical Search**: Find airports by proximity, country, or region

- **Real-time Suggestions**: Autocomplete-friendly search suggestions## 🚀 Quick Start

## 🚀 Quick Start### Prerequisites

### Prerequisites- Node.js 14+

- Node.js (v16 or higher)- npm

- npm or yarn package manager- AirportDB API token (sign up at [airportdb.io](https://airportdb.io))

### Installation### Installation

````bash1. **Clone the repository**

# Clone the repository

git clone <repository-url>   ```bash

cd runwayAPI   git clone <repository-url>

   cd runwayAPI

# Install dependencies   ```

npm install

2. **Install dependencies**

# Create environment file

cp .env.example .env   ```bash

   npm install

# Start the server   ```

npm start

```3. **Environment Setup**



### Development Mode   Create a `.env` file in the root directory:

```bash

# Start with auto-reload   ```env

npm run dev   SERVER_PORT_RUNWAY=3000

   AIRPORTDB_API_TOKEN=your_airportdb_api_token_here

# Run comprehensive tests   API_VERSION=1.0.0

npm run test:api   NODE_ENV=development

````

# View interactive demo

npm run demo:web4. **Start the server**

````

   ```bash

## 📡 API Endpoints   # Development mode

   npm run dev

### 🔍 Search Endpoints

   # Production mode

#### Basic Search   npm start

```bash   ```

GET /api/v1/airports/search?q=London&limit=10&fuzzy=true

```The server will start on the port specified in your environment variables (default: 3000).



#### Fuzzy Search with Scoring## 📡 API Endpoints

```bash

GET /api/v1/airports/fuzzy?q=EGKL&limit=5&details=true&format=simple### GET `/`

````

Welcome endpoint that returns basic API information.

#### City-Based Search

```````bash**Response:**

GET /api/v1/airports/city?q=Frankfurt&limit=10&fuzzy=true&format=simple

``````json

{

#### Smart ICAO Search  "code": 0,

```bash  "message": "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",

GET /api/v1/airports/smart-icao?q=LFGP&limit=5  "version": "1.0.0"

```}

```````

### 🏢 Data Endpoints

### GET `/api/v1/runway/:icao`

#### By Country

````bashGet runway and weather data for a specific airport.

GET /api/v1/airports/country/DE?limit=20&type=large_airport

```**Parameters:**



#### By Airport Code- `icao` (required) - ICAO airport code (e.g., KJFK, EGLL, LFPG)

```bash

GET /api/v1/airports/icao/EGLL**Query Parameters:**

GET /api/v1/airports/iata/LHR

```- `metarProvider` (optional) - Weather data provider

  - `aviationweather` (default) - AviationWeather.gov

#### Nearby Airports  - `vatsim` - VATSIM network

```bash

GET /api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=1.0&limit=10**Example Request:**

````

````bash

#### Statisticscurl "http://localhost:3000/api/v1/runway/KJFK?metarProvider=aviationweather"

```bash```

GET /api/v1/airports/stats/countries

GET /api/v1/airports/info**Success Response:**

````

````json

### 🛫 Runway & Weather{

```bash  "name": "John F Kennedy International Airport",

GET /api/v1/runway/EGLL  "home_link": "https://www.panynj.gov/airports/jfk.html",

GET /api/v1/runway/EDDF  "metar": "KJFK 101851Z 28008KT 10SM FEW250 24/18 A3012 RMK AO2 SLP198",

```  "runways": [

    {

## 💡 Format Options      "width_ft": 200,

      "length_ft": 14511,

### Simple Format (`format=simple`)      "le_ident": "04L",

Perfect for mobile apps and dropdowns:      "he_ident": "22R",

```json      "he_latitude_deg": 40.651798,

{      "he_longitude_deg": -73.776102,

  "code": 0,      "he_heading_degT": 223.1,

  "data": {      "le_ils": null,

    "airports": [      "he_ils": "ILS",

      {      "surface": "ASPH"

        "icao_code": "EGLL",    }

        "city": "London",   ],

        "country": "United Kingdom"  "elevation": 4,

      }  "wind_direction": 280,

    ]  "wind_speed": 8,

  }  "icao": "KJFK",

}  "station": {

```    "icao_code": "KJFK",

    "distance": 0

### Full Format (default)  },

Complete information with fuzzy scores:  "time": "2024-07-10T18:51:00Z",

```json  "metarData": {

{    "wind": {

  "code": 0,      "degrees": 280,

  "data": {      "speed_kts": 8

    "airports": [    },

      {    "observed": "2024-07-10T18:51:00Z"

        "icao_code": "EGLL",  }

        "name": "London Heathrow Airport",}

        "municipality": "London",```

        "country_name": "United Kingdom",

        "latitude_deg": 51.4706,**Error Responses:**

        "longitude_deg": -0.461941,

        "fuzzyScore": 96,Airport not found:

        "matchDetails": {

          "matches": ["ICAO fuzzy match (93.3%)", "Likely character transposition"]```json

        }{

      }  "code": 2,

    ]  "error": "Can't find airport XXXX data. Try to search a nearest bigger airport"

  }}

}```

````

No runway data:

## 🧠 Fuzzy Search Examples

````json

The API intelligently handles common typos and variations:{

  "code": 3,

| Query | Finds | Match Type |  "error": "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"

|-------|-------|------------|}

| `EGKL` | EGLL (Heathrow) | Character transposition |```

| `LFGP` | LFPG (Charles de Gaulle) | Character swap |

| `Parris` | Paris airports | City name typo |Invalid runway data:

| `Frankfrt` | Frankfurt airports | Missing vowel |

| `EGL` | EGLL (Heathrow) | Partial ICAO |```json

{

## 🌐 Interactive Demo  "code": 4,

  "error": "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"

Visit the built-in web interface:}

```bash```

http://localhost:3002/demo

```### Airport Database API Endpoints



Features:The API also provides comprehensive access to the EU airports database with the following endpoints:

- Real-time fuzzy search

- Match confidence scoring#### GET `/api/v1/airports/info`

- Multiple search modesGet general database information and available endpoints.

- Copy-friendly results

#### GET `/api/v1/airports/search?q={searchTerm}&limit={limit}`

## 🏗️ Project StructureSearch airports by name, ICAO code, IATA code, or municipality.



```**Example:**

runwayAPI/```bash

├── api/curl "http://localhost:3002/api/v1/airports/search?q=London&limit=5"

│   ├── airports.cjs        # Airport database endpoints```

│   └── runway.cjs          # Runway & weather endpoints

├── airportDB/#### GET `/api/v1/airports/country/{countryCode}?limit={limit}&type={type}`

│   ├── database.cjs        # SQLite database interfaceGet airports by country (2-letter ISO code).

│   ├── eu-airports.db      # SQLite database file

│   └── demo.cjs           # Database demo script**Example:**

├── helpers/```bash

│   ├── fuzzySearch.cjs     # Fuzzy search algorithmscurl "http://localhost:3002/api/v1/airports/country/GB?type=large_airport"

│   └── downloadData.cjs    # Data fetching utilities```

├── tests/

│   └── comprehensive-test.cjs # Complete API test suite#### GET `/api/v1/airports/icao/{icaoCode}`

├── __tests__/              # Jest unit testsGet detailed airport information by ICAO code.

├── demo.html              # Interactive web demo

├── main.cjs               # Express server#### GET `/api/v1/airports/iata/{iataCode}`

└── docs/                  # Documentation filesGet detailed airport information by IATA code.

````

#### GET `/api/v1/airports/type/{airportType}?limit={limit}`

## 🧪 TestingGet airports by type (large_airport, medium_airport, small_airport, heliport, etc.).

```bash#### GET `/api/v1/airports/nearby?lat={lat}&lng={lng}&radius={radius}&limit={limit}`

# Run comprehensive API testsFind airports near specific coordinates.

npm run test:api

**Example:**

# Run unit tests with Jest```bash

npm testcurl "http://localhost:3002/api/v1/airports/nearby?lat=48.8566&lng=2.3522&radius=2.0"

```

# Run with coverage

npm run test:coverage#### GET `/api/v1/airports/stats/countries`

Get statistical information about airports by country.

# Test specific endpoints

curl "http://localhost:3002/api/v1/airports/city?q=London&format=simple"📋 **For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

```

### 🎮 Interactive Demo

## 📊 Database Statistics

Try the live HTML demo for airport search:

- **Total Airports**: 12,228- **URL**: http://localhost:3002/demo

- **Countries Covered**: 52 (European region)- **Features**: Real-time ICAO code search, autocomplete, detailed airport info

- **Large Airports**: 118- **Usage**: Start typing any 3+ character ICAO code (e.g., "EGL", "LFP", "EDD")

- **Scheduled Service**: 659 airports

- **Database Size**: ~15MB optimized SQLite📋 **For demo instructions, see [DEMO.md](DEMO.md)**

- **Search Performance**: <100ms average response time

## 🏗️ Project Structure

## 🔧 Configuration

````

Environment variables (`.env`):runwayAPI/

```env├── main.cjs                 # Express server entry point

SERVER_PORT_RUNWAY=3002├── package.json             # Dependencies and scripts

API_VERSION=1.0.0├── jest.config.js          # Jest test configuration

NODE_ENV=development├── .env                    # Environment variables (create this)

```├── .env.test              # Test environment variables

├── demo.html              # Interactive airport search demo page

## 📈 Performance Features├── API_DOCUMENTATION.md    # Complete airport API documentation

├── DEMO.md                # Demo page documentation

- **In-Memory Caching**: Fuzzy search optimizations├── test-api.cjs           # API endpoint testing script

- **Database Indexing**: 7 strategic indexes for fast queries├── api/

- **Response Compression**: Automatic gzip compression│   ├── runway.cjs         # Main runway API endpoint

- **Connection Pooling**: Efficient SQLite connection management│   └── airports.cjs       # Airport database API endpoints

- **Format Optimization**: 70-83% bandwidth reduction with simple format├── airportDB/

│   ├── eu-airports.csv    # Original CSV airport data

## 🤝 Contributing│   ├── eu-airports.db     # SQLite database (generated)

│   ├── csv_to_sqlite.py   # CSV to SQLite converter

1. Fork the repository│   ├── database.cjs       # Database interface class

2. Create a feature branch: `git checkout -b feature/amazing-feature`│   ├── demo.cjs           # Database usage examples

3. Commit changes: `git commit -m 'Add amazing feature'`│   └── README.md          # Database documentation

4. Push to branch: `git push origin feature/amazing-feature`├── helpers/

5. Open a Pull Request│   └── downloadData.cjs   # HTTP request utility

└── __tests__/             # Test suite

## 📄 License    ├── setup.js           # Test configuration

    ├── __mocks__/         # Mock data

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.    ├── api/               # API endpoint tests

    ├── helpers/           # Helper function tests

## 🆘 Support    └── *.test.js         # Various test files

````

- 📚 **Documentation**: Check the `/docs` folder for detailed guides

- 🐛 **Issues**: Report bugs via GitHub Issues## 🧪 Testing

- 💡 **Feature Requests**: Open a discussion for new features

- 📧 **Questions**: Use GitHub Discussions for general questionsThe project includes a comprehensive test suite with 37 tests covering:

---- Unit tests for individual functions

- Integration tests for API endpoints

Built with ❤️ for the aviation community- Error handling scenarios

- Data validation and transformation

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests with verbose output
npm run test:verbose

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage

- **Overall Coverage**: 80% statements, 89.74% branches, 76.92% functions
- **API Logic**: 100% coverage for core runway API functionality

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Default       | Required |
| --------------------- | ------------------- | ------------- | -------- |
| `SERVER_PORT_RUNWAY`  | Server port         | 3000          | Yes      |
| `AIRPORTDB_API_TOKEN` | AirportDB API token | -             | Yes      |
| `API_VERSION`         | API version string  | "dev"         | No       |
| `NODE_ENV`            | Environment mode    | "development" | No       |

### CORS Configuration

CORS is automatically enabled in development mode. For production, configure CORS settings in `main.cjs` as needed for your specific use case.

## 📊 Data Sources

- **Airport Data**: [AirportDB.io](https://airportdb.io) - Comprehensive airport and runway information
- **Weather Data**:
  - [AviationWeather.gov](https://aviationweather.gov) - Official US aviation weather
  - [VATSIM](https://metar.vatsim.net) - Flight simulation network weather data

## 🔒 Security Considerations

- API tokens are loaded from environment variables
- Input validation for ICAO codes
- Error messages don't expose sensitive internal information
- Request logging for monitoring and debugging

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (if needed)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance

- Efficient data fetching with minimal external API calls
- Built-in request logging for monitoring
- Lightweight Express.js framework
- Optimized data validation and transformation

## 🐛 Troubleshooting

### Common Issues

1. **"Can't find airport data"** - Verify the ICAO code is correct and the airport exists in AirportDB
2. **"Invalid runway data"** - Some airports may have incomplete runway information
3. **Weather data unavailable** - Try switching METAR providers using the `metarProvider` parameter
4. **API token errors** - Ensure your `AIRPORTDB_API_TOKEN` is valid and properly set

### Debugging

Enable detailed logging by setting `NODE_ENV=development` and check console output for detailed request/response information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## 📄 License

ISC License - see package.json for details

## 🆘 Support

For API issues or questions:

- Check the test suite for usage examples
- Review error responses for specific error codes
- Ensure all environment variables are properly configured

---

**Made for aviation enthusiasts and developers** ✈️
