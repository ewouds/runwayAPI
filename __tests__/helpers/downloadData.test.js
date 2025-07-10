// Mock the request module before requiring the downloadFile
jest.mock("request", () => {
  return {
    get: jest.fn(),
  };
});

const downloadFile = require("../../helpers/downloadData.cjs");
const request = require("request");

describe("downloadData helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully download data from URL", async () => {
    const mockUrl = "https://example.com/data";
    const mockResponse = "mock response data";

    // Mock successful request
    request.get.mockImplementation((url, callback) => {
      expect(url).toBe(mockUrl);
      callback(null, {}, mockResponse);
    });

    const result = await downloadFile(mockUrl);
    expect(result).toBe(mockResponse);
    expect(request.get).toHaveBeenCalledWith(mockUrl, expect.any(Function));
  });

  it("should reject promise on request error", async () => {
    const mockUrl = "https://example.com/error";
    const mockError = new Error("Network error");

    // Mock failed request
    request.get.mockImplementation((url, callback) => {
      callback(mockError, null, null);
    });

    await expect(downloadFile(mockUrl)).rejects.toThrow("Network error");
  });

  it("should handle empty response", async () => {
    const mockUrl = "https://example.com/empty";

    request.get.mockImplementation((url, callback) => {
      callback(null, {}, "");
    });

    const result = await downloadFile(mockUrl);
    expect(result).toBe("");
  });
});
