const axios = require("axios");

/**
 * Download a remote resource as raw text (previous semantic of request.get body).
 * We intentionally disable axios JSON auto-parsing so callers can decide whether
 * to JSON.parse or treat the response as plain text (e.g. METAR data).
 * @param {string} url
 * @param {object} [config]
 * @returns {Promise<string>} raw response body
 */
const downloadFile = async (url, config = {}) => {
  try {
    const res = await axios.get(url, {
      responseType: "text",
      // Override default transform to prevent automatic JSON.parse
      transformResponse: [(data) => data],
      ...config,
    });
    // console.debug(`Downloaded ${url} - status: ${res.status}`);
    // console.debug(res.data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

module.exports = downloadFile;
