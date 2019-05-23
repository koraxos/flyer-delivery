var express = require("express");
var router = express.Router();
var config = require("../../config/environment"),
  auth = require("../lib/auth.js"),
  jadeCompiler = require("../lib/jadeCompiler");
var Promise = require("bluebird");
var path = require("path"),
  fs = require("fs");

var moment = require("moment");
var emailHelper = require("../helpers/email.js");
var nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "commande@distribeco.fr", // generated ethereal user
    pass: "distribeco2648" // generated ethereal password
  }
});

router.post("/get", function(req, res) {
  res.send();
});

router.post("/sendMail", function(req, res) {
  console.log(require("util").inspect(req, { depth: null }));
  console.log("body", req.body);

  var data = req.body.data;
  console.log("client", data.client);

  var created_at = moment().format("DD/MM/YYYY");
  var commande = data.commande;
  var net = data.commande.zones
    .map(_z => parseInt(_z.net, 10))
    .reduce((a, b) => a + b);
  var totalHT = 0;
  if (net >= 15000) {
    totalHT = Math.round(net * 0.06 * 0.8 * 100) / 100;
  } else if (net >= 10000) {
    totalHT = Math.round(net * 0.06 * 0.9 * 100) / 100;
  } else {
    totalHT = Math.round(net * 0.06 * 100) / 100;
  }

  commande.net = net;
  commande.totalHT = totalHT.toFixed(2);

  jadeCompiler.compile(
    "email_commande_distribeco",
    { date: created_at, client: data.client, commande: data.commande },
    function(err, html) {
      console.log("Err", err);
      console.log("html", html);
      if (!err) {
        // html = html;
        var mail = {
          from: '"Distribeco" <commande@distribeco.fr>', // sender address
          to: data.client.email, // list of receivers
          bcc: ["anthony.lacroix01@gmail.com", "contact@distribeco.fr"],
          subject: "Commande distribeco", // Subject line
          html: html
        };
        transporter
          .sendMail(mail)
          .then(email => {
            res.send("ça marche");
          })
          .catch(err => {
            console.log("Error");
            res.send("ça ne marche pas");
          });
      }
    }
  );
  // res.send("bonjour");
});

router.get("/getMe", auth, function(req, res) {
  req.session.commande.getZones().then(
    function(cmd) {
      cmd.calcTotal().then(
        function(cmd) {
          res.json({ client: req.session.client, commande: cmd });
        },
        function(err) {
          console.log(err);
          res.status(500).send(err);
        }
      );
    },
    function(err) {
      console.log(err);
      res.status(500).json(err);
    }
  );
});

router.get("/clear", auth, function(req, res) {
  // req.session.commande = null;
  // req.session.paiement = null;
  Commande.create({ client: req.session.client }, function(err, commande) {
    if (err) return res.status(500).send(err);
    req.session.commande = null;
    req.session.paiement = null;
    req.session.save(function(err) {
      if (err) return res.status(500).send(err);
      res.json({ error: false });
    });
  });
});

router.put("/", auth, function(req, res) {
  var commande = req.body.commande;
});

router.patch("/", auth, function(req, res) {
  var commandeId = req.body.commandeId,
    commande = req.body.commande;

  // console.log(commandeId);
  // console.log(commande);

  Commande.findOne({ _id: commande._id }).then(function(commandeDb) {
    commandeDb.intitule = commande.intitule;
    commandeDb.codePromo = commande.codePromo;
    commandeDb.format = commande.format;
    commandeDb.poid = commande.poid;
    commandeDb.contenu = commande.contenu;
    commandeDb.distribution = commande.distribution;
    commandeDb.setClient(req.session.client).then(
      function(cmd) {
        cmd.setZones(commande.zones).then(
          function(cmd) {
            cmd.calcTotal().then(
              function(cmd) {
                cmd.save(function(err) {
                  if (err) {
                    console.log("err Save");
                    console.log(err);
                    res.status(500).send(err);
                  }
                  cmd.getZones().then(function(cmd) {
                    req.session.commande = cmd;
                    req.session.save(function(err) {
                      if (err) {
                        console.log("err Save Session");
                        res.status(500).send(err);
                      } else res.json(cmd);
                    });
                  });
                });
              },
              function(err) {
                console.log("err Total");
                console.log(err);
                res.status(500).send(err);
              }
            );
          },
          function(err) {
            console.log("err Set Zones");
            console.log(err);
            res.status(500).send(err);
          }
        );
      },
      function(err) {
        console.log("err Set client");
        console.log(err);
        res.status(500).send(err);
      }
    );
  });
});

router.get("/email", auth, function(req, res) {
  Commande.findById(req.session.commande._id).then(
    function(commande) {
      commande.calcTotal().then(function(cmd) {
        cmd.getZones().then(
          function(cmd) {
            if (cmd.zones.length > 0)
              var totalNet = cmd.zones
                .map(function(z) {
                  return z.net;
                })
                .reduce(function(a, b) {
                  return a + b;
                });
            else var totalNet = 0;

            var options = {
              client: req.session.client,
              commande: cmd,
              totalNet: totalNet,
              moment: require("moment")
            };
            jadeCompiler.compile("email_commande", options, function(
              err,
              html
            ) {
              if (err) return res.status(500).send(err);

              var promDistral = new Promise(function(resolve, reject) {
                transporter.sendMail(
                  {
                    from: "Distral SA <noreply@distral.lu>",
                    to: config.email,
                    subject: "Nouvelle commande DISTRAL",
                    html: html
                  },
                  function(err, rep) {
                    if (err) reject(err);
                    else resolve(rep);
                  }
                );
              });

              var promAnthony = new Promise(function(resolve, reject) {
                transporter.sendMail(
                  {
                    from: "Distral SA <noreply@distral.lu>",
                    to: "anthony.lacroix01@gmail.com",
                    subject: "Nouvelle commande DISTRAL",
                    html: html
                  },
                  function(err, rep) {
                    if (err) reject(err);
                    else resolve(rep);
                  }
                );
              });

              var promClient = new Promise(function(resolve, reject) {
                if (req.session.client.email != "") {
                  transporter.sendMail(
                    {
                      from: "Distral SA <noreply@distral.lu>",
                      to: req.session.client.email,
                      subject: "Confirmation de votre commande DISTRAL",
                      html: html
                    },
                    function(err, rep) {
                      if (err) reject(err);
                      else resolve(rep);
                    }
                  );
                } else resolve(true);
              });

              Promise.all([promDistral, promClient, promAnthony]).then(
                function(reps) {
                  res.json(reps);
                },
                function(err) {
                  res.status(500).send(err);
                }
              );
            });
          },
          function(err) {
            console.warn(err);
            res.status(500).send(err);
          }
        );
      });
    },
    function(err) {
      console.warn(err);
      res.status(500).send(err);
    }
  );
});

module.exports = router;
