// Mock the request module before requiring the downloadFile
jest.mock("axios", () => ({
  get: jest.fn(),
}));

const downloadFile = require("../../helpers/downloadData.cjs");
const axios = require("axios");

describe("downloadData helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully download data from URL", async () => {
    const mockUrl = "https://example.com/data";
    const mockResponse = "mock response data";

    // Mock successful axios response
    axios.get.mockResolvedValue({ data: mockResponse });

    const result = await downloadFile(mockUrl);
    expect(result).toBe(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(mockUrl, expect.objectContaining({ responseType: "text" }));
  });

  it("should reject promise on request error", async () => {
    const mockUrl = "https://example.com/error";
    const mockError = new Error("Network error");

    // Mock failed axios
    axios.get.mockRejectedValue(mockError);

    await expect(downloadFile(mockUrl)).rejects.toThrow("Network error");
  });

  it("should handle empty response", async () => {
    const mockUrl = "https://example.com/empty";

    axios.get.mockResolvedValue({ data: "" });

    const result = await downloadFile(mockUrl);
    expect(result).toBe("");
  });
});
