const runwayAPI = require("../../api/runway.cjs");
const downloadFile = require("../../helpers/downloadData.cjs");
const { mockAirportData, mockMetarData } = require("../__mocks__/mockData");

// Mock the downloadFile helper
jest.mock("../../helpers/downloadData.cjs");

// Mock the metar parser
jest.mock("aewx-metar-parser", () => {
  return jest.fn((metarString) => {
    if (metarString.includes("28008KT")) {
      return {
        wind: {
          degrees: 280,
          degrees_from: 280,
          degrees_to: 280,
          speed_kts: 8,
        },
        observed: "2024-07-10T18:51:00Z",
      };
    }
    return {
      wind: {
        degrees: 0,
        degrees_from: 0,
        degrees_to: 359,
        speed_kts: 0,
      },
      observed: "2024-07-10T00:00:00Z",
    };
  });
});

describe("Runway API", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variables
    process.env.AIRPORTDB_API_TOKEN = "test-token";

    // Mock request and response objects
    mockReq = {
      params: { icao: "KJFK" },
      query: {},
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("Successful airport data retrieval", () => {
    it("should return complete airport and runway data for valid ICAO", async () => {
      // Mock successful API calls
      downloadFile
        .mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)) // Airport data
        .mockResolvedValueOnce(mockMetarData.valid); // METAR data

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John F Kennedy International Airport",
          icao: "KJFK",
          runways: expect.arrayContaining([
            expect.objectContaining({
              width_ft: 200,
              length_ft: 14511,
              le_ident: "04L",
              he_ident: "22R",
              surface: "ASPH",
            }),
          ]),
          wind_direction: 280,
          wind_speed: 8,
          elevation: expect.any(Number),
          metar: mockMetarData.valid,
          station: expect.objectContaining({
            icao_code: "KJFK",
            distance: 0,
          }),
        })
      );
    });

    it("should handle different METAR providers", async () => {
      mockReq.query.metarProvider = "vatsim";

      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      // Should call downloadFile with VATSIM URL
      expect(downloadFile).toHaveBeenCalledWith(expect.stringContaining("metar.vatsim.net"));
    });

    it("should handle empty METAR data gracefully", async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)).mockResolvedValueOnce(mockMetarData.empty);

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          icao: "KJFK",
          wind_direction: "VRB", // VRB case when degrees_from=0 and degrees_to=359
          wind_speed: 0,
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should return error for non-existent airport", async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify({}));

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: 2,
        error: "Can't find airport KJFK data. Try to search a nearest bigger airport",
      });
    });

    it("should return error for airport with no runways", async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.noRunways));

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: 3,
        error: "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport",
      });
    });

    it("should return error for airport with invalid runway data", async () => {
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.invalidRunways));

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: 4,
        error: "Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport",
      });
    });

    it("should handle network errors gracefully", async () => {
      downloadFile.mockRejectedValue(new Error("Network error"));

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Internal server error");
    });

    it("should handle JSON parsing errors", async () => {
      downloadFile.mockResolvedValueOnce("invalid json");

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith("Internal server error");
    });
  });

  describe("Data processing", () => {
    it("should correctly convert elevation from feet to meters", async () => {
      const airportWithElevation = {
        ...mockAirportData.valid,
        elevation_ft: 100,
      };

      downloadFile.mockResolvedValueOnce(JSON.stringify(airportWithElevation)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          elevation: 30, // 100 ft * 0.3048 = 30.48, rounded to 30
        })
      );
    });

    it("should handle missing elevation data", async () => {
      const airportWithoutElevation = {
        ...mockAirportData.valid,
        elevation_ft: null,
      };

      downloadFile.mockResolvedValueOnce(JSON.stringify(airportWithoutElevation)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          elevation: null,
        })
      );
    });

    it("should filter out invalid runways", async () => {
      const airportWithMixedRunways = {
        ...mockAirportData.valid,
        runways: [
          ...mockAirportData.valid.runways,
          {
            width_ft: "invalid",
            length_ft: "0",
            le_ident: "",
            he_ident: "22L",
            surface: "ASPH",
          },
        ],
      };

      downloadFile.mockResolvedValueOnce(JSON.stringify(airportWithMixedRunways)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          runways: expect.arrayContaining([
            expect.objectContaining({
              le_ident: "04L",
              he_ident: "22R",
            }),
            expect.objectContaining({
              le_ident: "04R",
              he_ident: "22L",
            }),
          ]),
        })
      );

      // Should only have 2 valid runways, not 3
      const call = mockRes.json.mock.calls[0][0];
      expect(call.runways).toHaveLength(2);
    });
  });

  describe("URL creation functions", () => {
    it("should create correct airport URL with API token", () => {
      // This tests the createAirportUrl function indirectly
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)).mockResolvedValueOnce(mockMetarData.valid);

      runwayAPI(mockReq, mockRes);

      expect(downloadFile).toHaveBeenCalledWith(`https://airportdb.io/api/v1/airport/KJFK?apiToken=test-token`);
    });

    it("should create correct METAR URL for different providers", async () => {
      // Test aviationweather (default)
      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      expect(downloadFile).toHaveBeenCalledWith(expect.stringContaining("aviationweather.gov"));

      // Test vatsim
      jest.clearAllMocks();
      mockReq.query.metarProvider = "vatsim";

      downloadFile.mockResolvedValueOnce(JSON.stringify(mockAirportData.valid)).mockResolvedValueOnce(mockMetarData.valid);

      await runwayAPI(mockReq, mockRes);

      expect(downloadFile).toHaveBeenCalledWith(expect.stringContaining("metar.vatsim.net"));
    });
  });
});
