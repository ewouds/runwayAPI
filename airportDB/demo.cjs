/**
 * Demo script showing how to use the SQLite airports database
 */

const AirportsDB = require("./database.cjs");

async function runDemo() {
  const db = new AirportsDB();

  try {
    // Connect to database
    await db.connect();

    console.log("🛫 EU Airports Database Demo\n");

    // 1. Search for airports by name
    console.log('1. Searching for "London" airports:');
    const londonAirports = await db.searchAirports("London");
    londonAirports.forEach((airport) => {
      console.log(`   • ${airport.name} (${airport.icao_code}/${airport.iata_code}) - ${airport.municipality}, ${airport.country_name}`);
    });

    // 2. Get large airports in Germany
    console.log("\n2. Large airports in Germany:");
    const germanLargeAirports = await db
      .getAirportsByCountry("DE")
      .then((airports) => airports.filter((a) => a.type === "large_airport").slice(0, 5));
    germanLargeAirports.forEach((airport) => {
      console.log(`   • ${airport.name} (${airport.icao_code}/${airport.iata_code}) - ${airport.municipality}`);
    });

    // 3. Get airport by ICAO code
    console.log("\n3. Looking up EGLL (London Heathrow):");
    const heathrow = await db.getAirportByICAO("EGLL");
    if (heathrow) {
      console.log(`   • ${heathrow.name}`);
      console.log(`   • Location: ${heathrow.latitude_deg}, ${heathrow.longitude_deg}`);
      console.log(`   • Elevation: ${heathrow.elevation_ft} ft`);
      console.log(`   • Municipality: ${heathrow.municipality}, ${heathrow.country_name}`);
    }

    // 4. Find airports near Paris (approximate coordinates)
    console.log("\n4. Airports near Paris (48.8566, 2.3522):");
    const nearParis = await db.getAirportsNearby(48.8566, 2.3522, 1.0, 5);
    nearParis.forEach((airport) => {
      console.log(`   • ${airport.name} (${airport.icao_code || "N/A"}/${airport.iata_code || "N/A"}) - Distance: ${airport.distance.toFixed(2)}°`);
    });

    // 5. Get country statistics
    console.log("\n5. Top 10 countries by airport count:");
    const stats = await db.getCountryStats();
    stats.slice(0, 10).forEach((country, index) => {
      console.log(
        `   ${index + 1}. ${country.country_name}: ${country.total_airports} total (${country.large_airports} large, ${
          country.scheduled_airports
        } scheduled)`
      );
    });

    // 6. Get all airport types
    console.log("\n6. Getting large airports only:");
    const largeAirports = await db.getAirportsByType("large_airport", 10);
    largeAirports.forEach((airport) => {
      console.log(`   • ${airport.name} (${airport.icao_code}/${airport.iata_code}) - ${airport.municipality}, ${airport.country_name}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close database connection
    await db.close();
  }
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
