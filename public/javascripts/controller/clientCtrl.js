"use strict";

myApp.controller("accueilCtrl", [
  "$scope",
  "$rootScope",
  "$timeout",
  "clientService",
  "commandeService",
  function($scope, $rootScope, $timeout, $clientService, $commandeService) {
    $scope.zones = new Array();
    $scope.regions = new Array();
    ($scope.sumNet = 0), ($scope.sumBrut = 0), ($scope.total = 0);
    $scope.commande = {};
    $scope.isOther = false;
    console.log($scope.isOther);

    $clientService.getMe().then(
      function(rep) {
        $timeout(function() {
          $scope.client = rep.client;
          $scope.commande = rep.commande;
          $scope.zones = rep.commande.zones.map(function(zone) {
            var villeName = zone["Ville"].replace("_", " ");
            return {
              Ville: zone["Ville"],
              name: villeName[0].toUpperCase() + villeName.substr(1),
              region: zone["region"],
              brut: zone["brut"],
              net: zone["net"]
            };
          });
          var format = $scope.commande.format;
          if (format != "A4" && format != "A5" && format != "A6")
            $scope.formatAutre = format;
          $scope.calcSum();
          runDatepicker();
          $scope.$apply();
        }, 150);
      },
      function(err) {
        console.warn(err);
        toastr.error(err.statusText);
      }
    );

    $scope.$watch("commande.distribution", function(newValue, oldValue) {
      console.log("commande", newValue, oldValue);
    });

    $scope.$watch("distribution", function(newValue, oldValue) {
      console.log("distribution", newValue, oldValue);
    });

    $scope.calcTotal = function() {
      // console.log("calc Total");
      // console.log($scope.commande.zones.length);
      $commandeService.modif($scope.commande._id, $scope.commande).then(
        function(cmd) {
          $scope.commande.total = cmd.total;
          $scope.commande.totalHT = cmd.totalHT;
        },
        function(err) {
          console.warn(err);
          toastr.error(err.statusText);
        }
      );
    };

    $scope.saveCommande = function(path) {
      console.log("save cmd");
      // debugger;
      // console.log($scope.commande.zones.length);
      // $commandeService.modif($scope.commande._id, $scope.commande).then(
      //   function(cmd) {
      // angular.copy(cmd, $scope.commande);
      $rootScope.commande = $scope.commande;
      $rootScope.go(path);
      // },
      // function(err) {
      //   console.warn(err);
      //   toastr.error(err.statusText);
      // }
      // );
    };

    $scope.ajout = function(data) {
      var villeName = data["Ville"].replace("_", " ");
      data["name"] = villeName[0].toUpperCase() + villeName.substr(1);
      $scope.zones.push(data);
      $scope.commande.zones = angular.copy($scope.zones);
      $scope.calcSum();
      $scope.$apply();
      return;
    };

    $scope.ajoutMulti = function(data, apply) {
      if (apply == undefined) apply = false;

      data.forEach(function(d) {
        var villeName = d["Ville"].replace("_", " ");
        d["name"] = villeName[0].toUpperCase() + villeName.substr(1);

        var idx = $scope.zones
          .map(function(zon) {
            return zon["Ville"];
          })
          .indexOf(d["Ville"]);

        if (idx === -1) $scope.zones.push(d);
      });
      $scope.commande.zones = angular.copy($scope.zones);
      $scope.calcSum();
      return;
    };

    $scope.remove = function(data, apply) {
      if (apply == undefined) apply = false;
      var idx = $scope.zones
        .map(function(zon) {
          return zon["Ville"];
        })
        .indexOf(data["Ville"]);
      if (idx !== -1) $scope.zones.splice(idx, 1);
      $scope.commande.zones = angular.copy($scope.zones);
      $scope.calcSum();
      if (apply) $scope.$apply();
      return;
    };

    $scope.removeMulti = function(data, apply) {
      if (apply == undefined) apply = false;

      data.forEach(function(d) {
        var idx = $scope.zones
          .map(function(zon) {
            return zon["Ville"];
          })
          .indexOf(d["Ville"]);
        if (idx !== -1) $scope.zones.splice(idx, 1);
      });
      $scope.commande.zones = angular.copy($scope.zones);
      $scope.calcSum();
      if (apply) $scope.$apply();
      return;
    };

    $scope.calcSum = function() {
      if ($scope.zones.length == 0) {
        $scope.sumBrut = 0;
        $scope.sumNet = 0;
        $scope.calcTotal();
        return;
      }

      $scope.sumBrut = $scope.zones
        .map(function(c) {
          return parseFloat(c["brut"]);
        })
        .reduce(function(a, b) {
          return a + b;
        });
      $scope.sumNet = $scope.zones
        .map(function(c) {
          return parseFloat(c["net"]);
        })
        .reduce(function(a, b) {
          return a + b;
        });

      if ($scope.sumNet >= 15000) {
        $scope.totalHT = Math.round($scope.sumNet * 0.06 * 0.8 * 100) / 100;
      } else if ($scope.sumNet >= 10000) {
        $scope.totalHT = Math.round($scope.sumNet * 0.06 * 0.9 * 100) / 100;
      } else {
        $scope.totalHT = Math.round($scope.sumNet * 0.06 * 100) / 100;
      }

      $timeout(function() {
        $("#listVille").scrollTop($("#listVille > table").height());
        // $scope.apply();
      }, 10);

      $scope.calcTotal();
      $scope.changeMap();
      return;
    };

    $scope.selectWeek = function(e) {
      debugger;
    };

    $scope.changeMap = function(e) {
      $scope.regions = new Array();

      console.log("TARGGGET", e);

      if ($scope.national) {
        $scope["ouest"] = true;
        $scope["nord"] = true;
        $scope["nordEst"] = true;
        $scope["est"] = true;
        $scope["sudEst"] = true;
        $scope["sud"] = true;
        $scope["sudOuest"] = true;
      } else if (e && e.target.id == "national") {
        $scope["ouest"] = false;
        $scope["nord"] = false;
        $scope["nordEst"] = false;
        $scope["est"] = false;
        $scope["sudEst"] = false;
        $scope["sud"] = false;
        $scope["sudOuest"] = false;
      }

      if ($scope["ouest"]) $scope.regions.push("ouest");
      if ($scope["nord"]) $scope.regions.push("nord");
      if ($scope["nordEst"]) $scope.regions.push("nordEst");
      if ($scope["est"]) $scope.regions.push("est");
      if ($scope["sudEst"]) $scope.regions.push("sudEst");
      if ($scope["sud"]) $scope.regions.push("sud");
      if ($scope["sudOuest"]) $scope.regions.push("sudOuest");

      console.log("REGIONS", $scope.regions);

      return;
    };

    $scope.addRegion = function(name, apply) {
      if (apply == undefined) apply = false;

      // if (name == "Nord / norden") $scope.nord = true;
      // if (name == "Est / osten") $scope.est = true;
      // if (name == "Sud / suden") $scope.sud = true;
      // if (name == "Centre / zentrum") $scope.centre = true;
      console.log("NAMMME", name);
      if (name === "ouest") $scope["ouest"] = true;
      if (name === "nord") $scope["nord"] = true;
      if (name === "nordEst") $scope["nordEst"] = true;
      if (name === "est") $scope["est"] = true;
      if (name === "sudEst") $scope["sudEst"] = true;
      if (name === "sud") $scope["sud"] = true;
      if (name === "sudOuest") $scope["sudOuest"] = true;

      if (
        $scope["ouest"] &&
        $scope["nord"] &&
        $scope["nordEst"] &&
        $scope["est"] &&
        $scope["sudEst"] &&
        $scope["sud"] &&
        $scope["sudOuest"]
      )
        $scope.national = true;
      else $scope.national = false;

      $scope.changeMap(false);
      if (apply) $scope.$apply();
    };
  }
]);

myApp.controller("commandeCtrl", [
  "$scope",
  "$rootScope",
  "clientService",
  "commandeService",
  function($scope, $rootScope, $clientService, $commandeService) {
    $scope.client = {};
    $scope.commande = {};
    $scope.zones = [];
    $scope.path = "";

    $clientService.getMe().then(
      function(rep) {
        $scope.client = rep.client;
        $scope.commande = rep.commande;
        $scope.zones = angular.copy(rep.commande.zones);
      },
      function(err) {
        console.warn(err);
      }
    );

    $scope.saveClient = function(path) {
      console.log("commande", $rootScope.commande);
      console.log("scope", $scope);

      // if (!path || path === undefined) path = $scope.path;
      // $clientService
      //   .modif($scope.client._id, $scope.client)
      //   .then(function(client) {
      //     angular.copy(client, $scope.client);
      //     $rootScope.go(path);
      //   });
    };
  }
]);

myApp.controller("paiementCtrl", [
  "$scope",
  "$location",
  "$rootScope",
  "clientService",
  "commandeService",
  "paiementService",
  function(
    $scope,
    $location,
    $rootScope,
    $clientService,
    $commandeService,
    $paiementService
  ) {
    $scope.client = {
      entreprise: "",
      adresse: "",
      ville: "",
      pays: "",
      activité: "",
      telephone: "",
      tva: ""
    };

    $scope.commande = {
      intitule: "",
      poid: "",
      format: "",
      contenu: "",
      semaine: "",
      total: 0
    };

    var hostName =
      $location.protocol() +
      "://" +
      $location.host() +
      ":" +
      $location.port() +
      "/";

    $scope.paiement = {
      montant: 0,
      percent: $scope.frais,
      cardRegistration: {
        AccessKey: "",
        CardRegistrationURL: hostName,
        CardType: "",
        PreregistrationData: "",
        returnURL: hostName + "reglement"
      },
      crypto: "",
      date: { mois: 1, year: 2018 }
    };

    $scope.enCours = false;

    $clientService.getMe().then(
      function(rep) {
        $scope.client = rep.client;
        $scope.commande = rep.commande;
        angular.copy(rep.commande.zones, $scope.zones);
        angular.copy(rep.commande.total, $scope.paiement.montant);
      },
      function(err) {
        console.warn(err);
      }
    );

    $scope.saveCard = function(card) {
      return $paiementService.saveCard(card).then(
        function(rep) {
          return true;
        },
        function(err) {
          console.warn(err);
          toastr.error(err.statusText);
          return false;
        }
      );
    };

    // $scope.saveClient = function(event){
    // 	$("#btn_paiement").val("... Validation en cours ...");
    // 	event.preventDefault();
    // 	$clientService.modif($scope.client._id, $scope.client).then(function(client){
    // 		angular.copy(client, $scope.client);
    // 		$paiementService.add($scope.paiement).then(function(client){
    // 			$scope.paiement.cardRegistration.AccessKey = client.cardRegistration.AccessKey;
    // 			$scope.paiement.cardRegistration.CardRegistrationURL = client.cardRegistration.CardRegistrationURL;
    // 			$scope.paiement.cardRegistration.CardType = client.cardRegistration.CardType;
    // 			$scope.paiement.cardRegistration.PreregistrationData = client.cardRegistration.PreregistrationData;
    // 			// $scope.$apply();
    // 			$("#btn_paiement").val("... Paiement en cours ...");
    // 			event.target.submit();
    // 		}, function(err){
    // 			console.warn(err);
    // 			toastr.error(err.statusText);
    // 		})
    // 	}, function(err){
    // 		console.warn(err);
    // 		toastr.error(err.statusText);
    // 	});
    // }

    $scope.mois = _.range(1, 13).map(function(n) {
      var d = new Date();
      d.setMonth(n);
      return n == 12 ? "12" : n < 10 ? "0" + d.getMonth() : d.getMonth();
    });

    $scope.years = _.range(15).map(function(n) {
      var d = new Date();
      d.setYear(d.getFullYear() + n);
      return d.getFullYear();
    });

    $scope.typeCard = function(e) {
      var val = $scope.paiement.carte;
      var newval = "";
      val = val.replace(/\s/g, "");
      for (var i = 0; i < val.length; i++) {
        if (i % 4 == 0 && i > 0) newval = newval.concat(" ");
        newval = newval.concat(val[i]);
      }
      $scope.paiement.carte = newval;
    };
  }
]);

myApp.controller("validationCtrl", [
  "$scope",
  "$rootScope",
  "$timeout",
  "commandeService",
  function($scope, $rootScope, $timeout, $commandeService) {
    var next = function() {
      $commandeService.clear();
      $timeout(function() {
        $rootScope.go("/");
      }, 2500);
    };

    $commandeService.email().then(
      function(rep) {
        next();
      },
      function(err) {
        console.warn(err);
        toastr.error(err.statusText);
        next();
      }
    );
  }
]);

myApp.controller("reglementCtrl", [
  "$scope",
  "$location",
  "$timeout",
  "commandeService",
  function($scope, $location, $timeout, $commandeService) {
    var next = function() {
      $commandeService.clear();
      $timeout(function() {
        $rootScope.go("/");
      }, 2500);
    };

    $commandeService.email().then(
      function(rep) {
        next();
      },
      function(err) {
        console.warn(err);
        toastr.error(err.statusText);
        next();
      }
    );
  }
]);
