# EU Airports SQLite Database

This directory contains the EU airports database converted from CSV to SQLite format.

## Files

- `eu-airports.csv` - Original CSV file with airport data
- `eu-airports.db` - SQLite database (generated from CSV)
- `csv_to_sqlite.py` - Python script to convert CSV to SQLite
- `database.cjs` - Node.js interface for querying the SQLite database
- `demo.cjs` - Demo script showing database usage examples

## Database Schema

The SQLite database contains a single `airports` table with the following structure:

```sql
CREATE TABLE airports (
    id INTEGER PRIMARY KEY,
    ident TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude_deg REAL,
    longitude_deg REAL,
    elevation_ft INTEGER,
    continent TEXT,
    country_name TEXT,
    iso_country TEXT,
    region_name TEXT,
    iso_region TEXT,
    local_region TEXT,
    municipality TEXT,
    scheduled_service INTEGER,
    gps_code TEXT,
    icao_code TEXT,
    iata_code TEXT,
    local_code TEXT,
    home_link TEXT,
    wikipedia_link TEXT,
    keywords TEXT,
    score INTEGER,
    last_updated TEXT
);
```

### Indexes

The following indexes are created for optimal query performance:

- `idx_airports_ident` - Airport identifier
- `idx_airports_icao_code` - ICAO airport code
- `idx_airports_iata_code` - IATA airport code
- `idx_airports_country` - Country ISO code
- `idx_airports_type` - Airport type
- `idx_airports_municipality` - Municipality/city
- `idx_airports_scheduled` - Scheduled service flag

## Database Statistics

- **Total Records**: 12,228 airports
- **Unique Countries**: 52
- **Large Airports**: 118
- **Airports with Scheduled Service**: 659

### Airport Types

- Small airports: 6,409
- Heliports: 3,011
- Closed airports: 1,757
- Medium airports: 874
- Large airports: 118
- Seaplane bases: 51
- Balloonports: 8

## Usage Examples

### Python

```python
import sqlite3

conn = sqlite3.connect('eu-airports.db')
cursor = conn.cursor()

# Find all airports in the UK
cursor.execute("SELECT name, icao_code, iata_code FROM airports WHERE iso_country = 'GB' AND type = 'large_airport'")
results = cursor.fetchall()

conn.close()
```

### Node.js

```javascript
const AirportsDB = require("./database.cjs");

async function example() {
  const db = new AirportsDB();
  await db.connect();

  // Search for airports
  const airports = await db.searchAirports("London");

  // Get airport by ICAO code
  const heathrow = await db.getAirportByICAO("EGLL");

  await db.close();
}
```

## API Methods (Node.js)

The `AirportsDB` class provides the following methods:

- `connect()` - Connect to the database
- `close()` - Close database connection
- `getAirportsByCountry(countryCode, limit)` - Get airports by country ISO code
- `searchAirports(searchTerm, limit)` - Search airports by name, code, or municipality
- `getAirportsByType(type, limit)` - Get airports by type (large_airport, medium_airport, etc.)
- `getAirportsNearby(lat, lng, radius, limit)` - Find airports near coordinates
- `getCountryStats()` - Get statistics by country
- `getAirportByICAO(icaoCode)` - Get specific airport by ICAO code
- `getAirportByIATA(iataCode)` - Get specific airport by IATA code

## Running the Demo

```bash
# Install dependencies
npm install sqlite3

# Run the demo
node airportDB/demo.cjs
```

## Regenerating the Database

If you need to regenerate the SQLite database from the CSV:

```bash
cd airportDB
python csv_to_sqlite.py
```

This will create a new `eu-airports.db` file with all data and indexes.
