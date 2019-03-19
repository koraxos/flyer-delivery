"use strict";

module.exports = {
  seed: false,
  mongo: {
    uri:
      "mongodb://heroku_7n5dd6qj:gqjdi671c8d92cf4jid69jmbal@ds123584.mlab.com:23584/heroku_7n5dd6qj"
  },
  website: "http://127.0.0.1:8084",
  email: "frere.thibaud@gmail.com",
  rib: {
    adresse: "test",
    name: "test",
    iban: "DE23100000001234567890",
    bic: "MARKDEF1100"
  },
  mangopay: {
    clientId: "bluescreen",
    clientPassword: "azvLRTKTgjT8a2mTiH7twL0ThjmrdJY2BYNCffYfoG7agZ1T2L",
    baseUrl: "https://api.sandbox.mangopay.com",
    fees: 1.5
  },
  port: 8084
};
