#!/usr/bin/env python3
"""
CSV to SQLite Converter for EU Airports Database
Converts the eu-airports.csv file to a SQLite database with proper data types and indexing.
"""

import csv
import sqlite3
import os
from datetime import datetime

def create_airports_database():
    """Convert CSV file to SQLite database with optimized schema."""
    
    # Define file paths
    csv_file = 'eu-airports.csv'
    db_file = 'eu-airports.db'
    
    # Remove existing database file if it exists
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Removed existing database: {db_file}")
    
    # Connect to SQLite database (creates new file)
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Create airports table with appropriate data types
    create_table_sql = """
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
    )
    """
    
    cursor.execute(create_table_sql)
    print("Created airports table with optimized schema")
    
    # Read CSV and insert data
    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        insert_sql = """
        INSERT INTO airports (
            id, ident, type, name, latitude_deg, longitude_deg, elevation_ft,
            continent, country_name, iso_country, region_name, iso_region,
            local_region, municipality, scheduled_service, gps_code, icao_code,
            iata_code, local_code, home_link, wikipedia_link, keywords, score,
            last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        row_count = 0
        for row in csv_reader:
            # Convert data types appropriately
            try:
                data = (
                    int(row['id']) if row['id'] else None,
                    row['ident'],
                    row['type'],
                    row['name'],
                    float(row['latitude_deg']) if row['latitude_deg'] else None,
                    float(row['longitude_deg']) if row['longitude_deg'] else None,
                    int(row['elevation_ft']) if row['elevation_ft'] else None,
                    row['continent'],
                    row['country_name'],
                    row['iso_country'],
                    row['region_name'],
                    row['iso_region'],
                    row['local_region'],
                    row['municipality'],
                    int(row['scheduled_service']) if row['scheduled_service'] else None,
                    row['gps_code'] if row['gps_code'] else None,
                    row['icao_code'] if row['icao_code'] else None,
                    row['iata_code'] if row['iata_code'] else None,
                    row['local_code'] if row['local_code'] else None,
                    row['home_link'] if row['home_link'] else None,
                    row['wikipedia_link'] if row['wikipedia_link'] else None,
                    row['keywords'] if row['keywords'] else None,
                    int(row['score']) if row['score'] else None,
                    row['last_updated']
                )
                
                cursor.execute(insert_sql, data)
                row_count += 1
                
                if row_count % 1000 == 0:
                    print(f"Processed {row_count} records...")
                    
            except (ValueError, TypeError) as e:
                print(f"Error processing row {row_count + 1}: {e}")
                print(f"Problematic row: {row}")
                continue
    
    # Create indexes for better query performance
    indexes = [
        "CREATE INDEX idx_airports_ident ON airports(ident)",
        "CREATE INDEX idx_airports_icao_code ON airports(icao_code)",
        "CREATE INDEX idx_airports_iata_code ON airports(iata_code)",
        "CREATE INDEX idx_airports_country ON airports(iso_country)",
        "CREATE INDEX idx_airports_type ON airports(type)",
        "CREATE INDEX idx_airports_municipality ON airports(municipality)",
        "CREATE INDEX idx_airports_scheduled ON airports(scheduled_service)"
    ]
    
    for index_sql in indexes:
        cursor.execute(index_sql)
    
    print(f"Created {len(indexes)} indexes for optimized queries")
    
    # Commit changes and close connection
    conn.commit()
    
    # Display statistics
    cursor.execute("SELECT COUNT(*) FROM airports")
    total_records = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT country_name) FROM airports")
    unique_countries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM airports WHERE type = 'large_airport'")
    large_airports = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM airports WHERE scheduled_service = 1")
    scheduled_airports = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"\n=== Database Creation Complete ===")
    print(f"Database file: {db_file}")
    print(f"Total records imported: {total_records}")
    print(f"Unique countries: {unique_countries}")
    print(f"Large airports: {large_airports}")
    print(f"Airports with scheduled service: {scheduled_airports}")
    
    return db_file

def test_database(db_file):
    """Test the created database with sample queries."""
    print(f"\n=== Testing Database ===")
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Test queries
    test_queries = [
        ("Sample airports by country", 
         "SELECT name, municipality, icao_code, iata_code FROM airports WHERE iso_country = 'GB' AND type = 'large_airport' LIMIT 5"),
        
        ("Airports by type count", 
         "SELECT type, COUNT(*) as count FROM airports GROUP BY type ORDER BY count DESC"),
        
        ("Top 5 highest airports", 
         "SELECT name, municipality, country_name, elevation_ft FROM airports WHERE elevation_ft IS NOT NULL ORDER BY elevation_ft DESC LIMIT 5"),
        
        ("Countries with most airports", 
         "SELECT country_name, COUNT(*) as airport_count FROM airports GROUP BY country_name ORDER BY airport_count DESC LIMIT 10")
    ]
    
    for title, query in test_queries:
        print(f"\n{title}:")
        print("-" * len(title))
        cursor.execute(query)
        results = cursor.fetchall()
        
        for row in results:
            print(f"  {row}")
    
    conn.close()

if __name__ == "__main__":
    try:
        db_file = create_airports_database()
        test_database(db_file)
        print(f"\n✅ Successfully converted CSV to SQLite database: {db_file}")
    except Exception as e:
        print(f"❌ Error: {e}")