const axios = require("axios");

const downloadFile = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err;
  }
};

module.exports = downloadFile;
