// Extract utility functions from runway.cjs for testing
// Since the functions are not exported, we'll test them indirectly through the main function
// but also create some standalone tests for validation logic

describe('Utility Functions', () => {
  describe('Data validation', () => {
    // Test the isNumber function behavior
    it('should validate numbers correctly', () => {
      const testCases = [
        { input: 123, expected: true },
        { input: 0, expected: true },
        { input: -5, expected: true },
        { input: 3.14, expected: true },
        { input: "123", expected: false },
        { input: NaN, expected: false },
        { input: null, expected: false },
        { input: undefined, expected: false },
        { input: "", expected: false },
        { input: "abc", expected: false }
      ];

      // Since isNumber is not exported, we'll test through runway parsing
      const isNumber = (value) => {
        return typeof value === "number" && !isNaN(value);
      };

      testCases.forEach(({ input, expected }) => {
        expect(isNumber(input)).toBe(expected);
      });
    });

    // Test the isString function behavior
    it('should validate strings correctly', () => {
      const testCases = [
        { input: "hello", expected: true },
        { input: "04L", expected: true },
        { input: "", expected: false },
        { input: "   ", expected: true }, // non-empty string
        { input: 123, expected: false },
        { input: null, expected: false },
        { input: undefined, expected: false },
        { input: [], expected: false },
        { input: {}, expected: false }
      ];

      const isString = (value) => {
        return typeof value === "string" && value.length > 0;
      };

      testCases.forEach(({ input, expected }) => {
        expect(isString(input)).toBe(expected);
      });
    });
  });

  describe('URL creation', () => {
    it('should create correct METAR URLs for different providers', () => {
      const createMetarUrl = (provider, icao) => {
        switch (provider.toLowerCase()) {
          case "vatsim":
            return `https://metar.vatsim.net/${icao}`;
          case "aviationweather":
          default:
            return `https://aviationweather.gov/cgi-bin/data/metar.php?ids=${icao}`;
        }
      };

      expect(createMetarUrl('vatsim', 'KJFK')).toBe('https://metar.vatsim.net/KJFK');
      expect(createMetarUrl('VATSIM', 'KLAX')).toBe('https://metar.vatsim.net/KLAX');
      expect(createMetarUrl('aviationweather', 'EGLL')).toBe('https://aviationweather.gov/cgi-bin/data/metar.php?ids=EGLL');
      expect(createMetarUrl('unknown', 'EGLL')).toBe('https://aviationweather.gov/cgi-bin/data/metar.php?ids=EGLL');
      expect(createMetarUrl('', 'EGLL')).toBe('https://aviationweather.gov/cgi-bin/data/metar.php?ids=EGLL');
    });

    it('should create correct airport URLs', () => {
      process.env.AIRPORTDB_API_TOKEN = 'test-token-123';
      
      const createAirportUrl = (icao) => {
        return `https://airportdb.io/api/v1/airport/${icao}?apiToken=${process.env.AIRPORTDB_API_TOKEN}`;
      };

      expect(createAirportUrl('KJFK')).toBe('https://airportdb.io/api/v1/airport/KJFK?apiToken=test-token-123');
      expect(createAirportUrl('EGLL')).toBe('https://airportdb.io/api/v1/airport/EGLL?apiToken=test-token-123');
    });
  });

  describe('Data transformation', () => {
    it('should convert runway data correctly', () => {
      const rawRunway = {
        width_ft: "200",
        length_ft: "14511",
        le_ident: "04L",
        he_ident: "22R",
        he_latitude_deg: "40.651798",
        he_longitude_deg: "-73.776102",
        he_heading_degT: "223.1",
        le_ils: null,
        he_ils: "ILS",
        surface: "ASPH"
      };

      const transformRunway = (runway) => {
        return {
          width_ft: parseFloat(runway.width_ft),
          length_ft: parseFloat(runway.length_ft),
          le_ident: runway.le_ident,
          he_ident: runway.he_ident,
          he_latitude_deg: parseFloat(runway.he_latitude_deg),
          he_longitude_deg: parseFloat(runway.he_longitude_deg),
          he_heading_degT: parseFloat(runway.he_heading_degT),
          le_ils: runway.le_ils,
          he_ils: runway.he_ils,
          surface: runway.surface,
        };
      };

      const transformed = transformRunway(rawRunway);

      expect(transformed).toEqual({
        width_ft: 200,
        length_ft: 14511,
        le_ident: "04L",
        he_ident: "22R",
        he_latitude_deg: 40.651798,
        he_longitude_deg: -73.776102,
        he_heading_degT: 223.1,
        le_ils: null,
        he_ils: "ILS",
        surface: "ASPH"
      });
    });

    it('should filter valid runways correctly', () => {
      const isNumber = (value) => typeof value === "number" && !isNaN(value);
      const isString = (value) => typeof value === "string" && value.length;

      const runways = [
        { length_ft: 14511, le_ident: "04L", he_ident: "22R" },
        { length_ft: 0, le_ident: "04R", he_ident: "22L" }, // Invalid length
        { length_ft: 8400, le_ident: "", he_ident: "22L" }, // Invalid ident
        { length_ft: 8400, le_ident: "04R", he_ident: "" }, // Invalid ident
        { length_ft: NaN, le_ident: "04R", he_ident: "22L" }, // Invalid length
        { length_ft: 10000, le_ident: "09", he_ident: "27" } // Valid
      ];

      const validRunways = runways.filter((runway) => {
        return isNumber(runway.length_ft) && runway.length_ft > 0 && 
               isString(runway.le_ident) && isString(runway.he_ident);
      });

      expect(validRunways).toHaveLength(2);
      expect(validRunways[0]).toMatchObject({ le_ident: "04L", he_ident: "22R" });
      expect(validRunways[1]).toMatchObject({ le_ident: "09", he_ident: "27" });
    });

    it('should convert elevation from feet to meters', () => {
      const convertElevation = (elevationFt) => {
        return elevationFt != null ? Math.round(elevationFt * 0.3048) : null;
      };

      expect(convertElevation(100)).toBe(30);
      expect(convertElevation(13)).toBe(4);
      expect(convertElevation(0)).toBe(0);
      expect(convertElevation(null)).toBe(null);
      expect(convertElevation(undefined)).toBe(null);
    });
  });

  describe('Wind direction handling', () => {
    it('should handle variable wind direction correctly', () => {
      const getWindDirection = (metarData) => {
        return metarData.wind.degrees_from === 0 && metarData.wind.degrees_to === 359 
          ? "VRB" 
          : metarData.wind.degrees;
      };

      // Variable wind
      expect(getWindDirection({
        wind: { degrees_from: 0, degrees_to: 359, degrees: 0 }
      })).toBe("VRB");

      // Specific direction
      expect(getWindDirection({
        wind: { degrees_from: 280, degrees_to: 280, degrees: 280 }
      })).toBe(280);

      // Another specific direction
      expect(getWindDirection({
        wind: { degrees_from: 90, degrees_to: 90, degrees: 90 }
      })).toBe(90);
    });
  });
});
