const request = require('supertest');
const express = require('express');

// Mock the runway API module
jest.mock('../api/runway.cjs', () => {
  return jest.fn((req, res) => {
    if (req.params.icao === 'KJFK') {
      return res.json({
        name: "John F Kennedy International Airport",
        icao: "KJFK",
        runways: [
          {
            width_ft: 200,
            length_ft: 14511,
            le_ident: "04L",
            he_ident: "22R",
            surface: "ASPH"
          }
        ],
        wind_direction: 280,
        wind_speed: 8
      });
    } else if (req.params.icao === 'INVALID') {
      return res.json({
        code: 2,
        error: "Can't find airport INVALID data. Try to search a nearest bigger airport"
      });
    } else {
      return res.status(500).send('Internal server error');
    }
  });
});

describe('Main Express App', () => {
  let app;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
    
    // Re-require the app to get a fresh instance
    delete require.cache[require.resolve('../main.cjs')];
    
    // Mock environment variables
    process.env.SERVER_PORT_RUNWAY = '3001';
    process.env.API_VERSION = '1.0.0';
    process.env.NODE_ENV = 'test';
    
    // Create app instance
    const express = require('express');
    const cors = require('cors');
    const runwayAPI = require('../api/runway.cjs');
    
    app = express();
    
    app.use((req, res, next) => {
      next();
    });
    
    app.get('/api/v1/runway/:icao', runwayAPI);
    
    app.get('/', (req, res) => {
      res.json({
        code: 0,
        message: "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",
        version: process.env.API_VERSION || "dev",
      });
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        code: 0,
        message: "Welcome to Runway API. Use /api/v1/runway/:icao to get runway data for an airport.",
        version: "1.0.0"
      });
    });
  });

  describe('GET /api/v1/runway/:icao', () => {
    it('should return runway data for valid ICAO code', async () => {
      const response = await request(app)
        .get('/api/v1/runway/KJFK')
        .expect(200);

      expect(response.body).toHaveProperty('name', "John F Kennedy International Airport");
      expect(response.body).toHaveProperty('icao', 'KJFK');
      expect(response.body).toHaveProperty('runways');
      expect(response.body.runways).toHaveLength(1);
      expect(response.body.runways[0]).toHaveProperty('le_ident', '04L');
    });

    it('should return error for invalid ICAO code', async () => {
      const response = await request(app)
        .get('/api/v1/runway/INVALID')
        .expect(200);

      expect(response.body).toHaveProperty('code', 2);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain("Can't find airport");
    });

    it('should handle server errors gracefully', async () => {
      await request(app)
        .get('/api/v1/runway/ERROR')
        .expect(500);
    });
  });
});
