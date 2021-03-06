'use strict';

module.exports = {
  ip: process.env.IP || undefined,
  mongo: {
    uri: 'mongodb://localhost/distralsa'
  },
  website:"https://app.distral.lu",
  email:"frere.thibaud@gmail.com",
  rib:{
    adresse:"ZARE Ouest îlot 16 L - 4384 Ehlerange  ",
    name:"Distral S.A",
  	iban:"LU850141542778800000",
  	bic:"CELLLULL"
  },
  mangopay:{
    clientId:"bluescreenprod",
    clientPassword:"2O7bf9msFZQEBZ6t0WR6wqNsHPe1ShiYjVQFrf0rUN0AurkEZn",
    baseUrl:"https://api.mangopay.com",
    fees:1.5
  },
  port:8084,
  seed: true
};
