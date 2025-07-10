// Mock data for airport responses
const mockAirportData = {
  valid: {
    ident: "KJFK",
    icao_code: "KJFK",
    name: "John F Kennedy International Airport",
    home_link: "https://www.panynj.gov/airports/jfk.html",
    elevation_ft: 13,
    station: {
      icao_code: "KJFK",
      distance: 0,
    },
    runways: [
      {
        width_ft: "200",
        length_ft: "14511",
        le_ident: "04L",
        he_ident: "22R",
        he_latitude_deg: "40.651798",
        he_longitude_deg: "-73.776102",
        he_heading_degT: "223.1",
        le_ils: null,
        he_ils: "ILS",
        surface: "ASPH",
      },
      {
        width_ft: "150",
        length_ft: "8400",
        le_ident: "04R",
        he_ident: "22L",
        he_latitude_deg: "40.627701",
        he_longitude_deg: "-73.759102",
        he_heading_degT: "223.1",
        le_ils: "ILS",
        he_ils: "ILS",
        surface: "ASPH",
      },
    ],
  },
  noRunways: {
    ident: "TEST",
    icao_code: "TEST",
    name: "Test Airport",
    home_link: "https://test.com",
    elevation_ft: 100,
    runways: [],
  },
  invalidRunways: {
    ident: "TEST2",
    icao_code: "TEST2",
    name: "Test Airport 2",
    home_link: "https://test2.com",
    elevation_ft: 100,
    runways: [
      {
        width_ft: "invalid",
        length_ft: "invalid",
        le_ident: "",
        he_ident: "",
        surface: "ASPH",
      },
    ],
  },
  notFound: null,
};

const mockMetarData = {
  valid: "KJFK 101851Z 28008KT 10SM FEW250 24/18 A3012 RMK AO2 SLP198 T02440183",
  empty: "",
};

module.exports = {
  mockAirportData,
  mockMetarData,
};
