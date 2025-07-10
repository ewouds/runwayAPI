const request = require('supertest');
const express = require('express');
const cors = require('cors');
const runwayAPI = require('../api/runway.cjs');
const downloadFile = require('../helpers/downloadData.cjs');
const { mockAirportData, mockMetarData } = require('./__mocks__/mockData');

// Mock the downloadFile helper for integration tests
jest.mock('../helpers/downloadData.cjs');

describe('Runway API Integration Tests', () => {
  let app;

  beforeAll(() => {
    // Set up the Express app exactly like in main.cjs
    app = express();
    
    if (process.env.NODE_ENV === "development") {
      app.use(cors());
    }

    app.use((req, res, next) => {
      next(); // Skip logging in tests
    });

    app.get("/api/v1/runway/:icao", runwayAPI);

    app.get("/", (req, res) => {
      res.json({
        code: 0,
        message: "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",
        version: process.env.API_VERSION || "dev",
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AIRPORTDB_API_TOKEN = 'test-token';
  });

  describe('Full API workflow', () => {
    it('should handle complete successful request flow', async () => {
      // Mock both API calls
      downloadFile
        .mockResolvedValueOnce(JSON.stringify(mockAirportData.valid))
        .mockResolvedValueOnce(mockMetarData.valid);

      const response = await request(app)
        .get('/api/v1/runway/KJFK')
        .expect(200);

      // Verify complete response structure
      expect(response.body).toMatchObject({
        name: "John F Kennedy International Airport",
        home_link: "https://www.panynj.gov/airports/jfk.html",
        icao: "KJFK",
        runways: expect.arrayContaining([
          expect.objectContaining({
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
          })
        ]),
        elevation: 4, // 13 ft * 0.3048 ≈ 4m
        wind_direction: expect.any(Number),
        wind_speed: expect.any(Number),
        station: expect.objectContaining({
          icao_code: "KJFK",
          distance: 0
        }),
        time: expect.any(String),
        metar: mockMetarData.valid,
        metarData: expect.any(Object)
      });
    });

    it('should handle METAR provider parameter', async () => {
      downloadFile
        .mockResolvedValueOnce(JSON.stringify(mockAirportData.valid))
        .mockResolvedValueOnce(mockMetarData.valid);

      const response = await request(app)
        .get('/api/v1/runway/KJFK?metarProvider=vatsim')
        .expect(200);

      expect(response.body.icao).toBe('KJFK');
      
      // Verify that the correct METAR URL was called
      expect(downloadFile).toHaveBeenCalledWith(
        expect.stringContaining('metar.vatsim.net/KJFK')
      );
    });

    it('should handle case-insensitive ICAO codes', async () => {
      downloadFile
        .mockResolvedValueOnce(JSON.stringify(mockAirportData.valid))
        .mockResolvedValueOnce(mockMetarData.valid);

      const response = await request(app)
        .get('/api/v1/runway/kjfk') // lowercase
        .expect(200);

      expect(response.body.icao).toBe('KJFK'); // Should be uppercase in response
    });
  });

  describe('Error scenarios', () => {
    it('should return appropriate error for non-existent airport', async () => {
      downloadFile.mockResolvedValueOnce('{}');

      const response = await request(app)
        .get('/api/v1/runway/XXXX')
        .expect(200);

      expect(response.body).toEqual({
        code: 2,
        error: "Can't find airport XXXX data. Try to search a nearest bigger airport"
      });
    });

    it('should handle network failures gracefully', async () => {
      downloadFile.mockRejectedValue(new Error('Network timeout'));

      const response = await request(app)
        .get('/api/v1/runway/KJFK')
        .expect(500);

      expect(response.text).toBe('Internal server error');
    });

    it('should handle airports with no runway data', async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.noRunways));

      const response = await request(app)
        .get('/api/v1/runway/TEST')
        .expect(200);

      expect(response.body).toEqual({
        code: 3,
        error: "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"
      });
    });

    it('should handle airports with invalid runway data', async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.invalidRunways));

      const response = await request(app)
        .get('/api/v1/runway/TEST2')
        .expect(200);

      expect(response.body).toEqual({
        code: 4,
        error: "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport"
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing METAR data', async () => {
      downloadFile
        .mockResolvedValueOnce(JSON.stringify(mockAirportData.valid))
        .mockResolvedValueOnce(''); // Empty METAR

      const response = await request(app)
        .get('/api/v1/runway/KJFK')
        .expect(200);

      expect(response.body.icao).toBe('KJFK');
      expect(response.body.metar).toContain('KJFK'); // Should have fallback METAR
    });

    it('should handle different weather station for METAR', async () => {
      const airportWithDifferentStation = {
        ...mockAirportData.valid,
        station: {
          icao_code: "KLGA",
          distance: 5
        }
      };

      downloadFile
        .mockResolvedValueOnce(JSON.stringify(airportWithDifferentStation))
        .mockResolvedValueOnce(mockMetarData.valid);

      const response = await request(app)
        .get('/api/v1/runway/KJFK')
        .expect(200);

      expect(response.body.station).toEqual({
        icao_code: "KLGA",
        distance: 5
      });

      // Should fetch METAR from the station ICAO, not airport ICAO
      expect(downloadFile).toHaveBeenCalledWith(
        expect.stringContaining('KLGA')
      );
    });
  });
});
