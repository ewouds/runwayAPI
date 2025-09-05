const downloadFile = require("../helpers/downloadData.cjs");
const metarParser = require("aewx-metar-parser");

const createMetarUrl = (provider, icao) => {
  switch (provider.toLowerCase()) {
    case "vatsim":
      return `https://metar.vatsim.net/${icao}`;
    case "aviationweather":
    default:
      return `https://aviationweather.gov/cgi-bin/data/metar.php?ids=${icao}`;
  }
};

const createAirportUrl = (icao) => `https://airportdb.io/api/v1/airport/${icao}?apiToken=${process.env.AIRPORTDB_API_TOKEN}`;

const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};

const isString = (value) => {
  return typeof value === "string" && value.length;
};

const runwayAPI = async (req, res) => {
  console.log("runwayAPI", req.params);
  try {
    const { icao } = req.params;
    const metarProvider = req.query.metarProvider || "aviationweather";
    const airportUrl = createAirportUrl(icao);
    const airportDataRaw = await downloadFile(airportUrl);
    console.debug(airportDataRaw);
    const airportData = JSON.parse(airportDataRaw);
    console.debug(`Airport data for ${icao.toUpperCase()}:`, airportData);

    if (!airportData.ident) {
      console.error(`Can't find airport ${icao.toUpperCase()} data. Response: ${airportDataRaw}`);
      return res.json({
        code: 2,
        error: `Can't find airport ${icao.toUpperCase()} data. Try to search a nearest bigger airport`,
      });
    }
    if (!airportData.runways || !airportData.runways.length) {
      console.error(`Airport ${icao.toUpperCase()} has no runways data. Response: ${airportDataRaw}`);
      return res.json({
        code: 3,
        error: `Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport`,
      });
    }

    let station = {
      icao_code: airportData.icao_code,
      distance: 0,
    };
    if (airportData.station && airportData.station.icao_code !== airportData.icao_code) {
      station = airportData.station;
    }

    const runways = airportData.runways.map((runway) => {
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
    });
    // console.debug(`Runways for ${icao.toUpperCase()}:`, runways);

    const validRunways = runways.filter((runway) => {
      return isNumber(runway.length_ft) && runway.length_ft > 0 && isString(runway.le_ident) && isString(runway.he_ident);
    });
    // console.debug(`Valid runways for ${icao.toUpperCase()}:`, validRunways);

    if (!validRunways.length) {
      console.error(`Airport ${icao.toUpperCase()} has no valid runways data. Response: ${airportDataRaw}`);
      return res.json({
        code: 4,
        error: `Sorry. The requested airport has invalid runway data, so it can't be displayed. Try other nearest airport`,
      });
    }
    console.log(`station`, station);
    const metarUrl = createMetarUrl(metarProvider, station.icao_code);
    console.debug(`Fetching METAR data from: ${metarUrl}`);
    let metar = await downloadFile(metarUrl);
    console.debug(`METAR data for ${icao.toUpperCase()}:`, metar);
    if (!metar.trim()) {
      console.error(`Can't find airport ${icao.toUpperCase()} metar data. Response: ${metar}`);
      metar = `${icao.toUpperCase()} 000000Z AUTO 00000KT 9999 0/0 Q1013 `;
    }

    const metarData = metarParser(metar.trim());
    //console.debug(`METAR data for ${icao.toUpperCase()}:`, metarData);

    const rawMetar = metar;
    const wind_direction = metarData.wind.degrees_from === 0 && metarData.wind.degrees_to === 359 ? "VRB" : metarData.wind.degrees;
    const wind_speed = metarData.wind.speed_kts;
    const time = metarData.observed;
    const elevation = airportData.elevation_ft ? Math.round(airportData.elevation_ft * 0.3048) : null;

    res.json({
      name: airportData.name,
      home_link: airportData.home_link,
      metar: rawMetar,
      runways: validRunways,
      elevation: elevation,
      wind_direction,
      wind_speed,
      icao: icao.toUpperCase(),
      station,
      time,
      metarData,
    });
  } catch (err) {
    console.error(`Error in runwayAPI for ${req.params.icao}:`);

    console.error(err);

    return res.status(500).send("Internal server error");
  }
};

module.exports = runwayAPI;
