'use strict';



var myApp = angular.module("distralsa", ['ngAnimate','ngResource', 'ngRoute', 'ngDialog', 
		'ngMaterial', 'ngCookies', 'ngSanitize', 'ngCsv', 'client.services', 'commande.services', 'paiement.services', 'promotion.services']);


myApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common["X-Requested-With"] =  'XMLHttpRequest';
	$httpProvider.defaults.headers.common["Content-Type"] =  'application/json';

	if (!$httpProvider.defaults.headers.get)
        $httpProvider.defaults.headers.get = {};

	$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
	$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';


}]);



myApp.config(['$mdAriaProvider', function($mdAriaProvider) {
   // Globally disables all ARIA warnings.
   $mdAriaProvider.disableWarnings();
}]);



myApp.config(function($mdIconProvider) {
	$mdIconProvider
		.iconSet("call", 'icons/sets/communication-icons.svg', 24)
		.iconSet("social", 'icons/sets/social-icons.svg', 24);
});





myApp.run(function($rootScope, $templateCache, $location, $document, clientService, commandeService) {

	$rootScope.loading =  false;
	$rootScope.event =  false;
	$rootScope.next =  false;
	$rootScope.drapeau =  "svg/fr.svg";
	$rootScope.lang =  "fr";
	$rootScope.langData =  [];
	$rootScope.current =  false;
	$rootScope.msie=false;


	clientService.loadLang().then(function(data){
		$rootScope.langData = data.langs;
		$rootScope.lang = data.client.lang;
	}, function(err){
		console.warn(err);
		toastr.error(err.statusText);
	});

	$rootScope.$on("$locationChangeStart", function(event, next, current) {
		$rootScope.loading = true;
		var hostName = $location.protocol()+"://"+$location.host()+"/";

		$rootScope.event = event;
		$rootScope.next = next.replace(hostName, "");
		$rootScope.current = current.replace(hostName, "");

		$rootScope.next = $rootScope.next == "" ? "accueil" : $rootScope.next;
		$rootScope.current = $rootScope.current == "" ? "accueil" : $rootScope.current;


	});


	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
		$rootScope.loading = false;
	});


	$rootScope.go = function (path) {
		$location.path(path);
	};


	var originatorEv;
	$rootScope.openMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };



    $rootScope.changeLang = function(ev, lang){

    	$rootScope.lang = lang;

    	clientService.changeLang(lang).then(function(data){
    		$rootScope.langData = data.langs;
    		$rootScope.lang = data.client.lang;
    	}, function(err){
    		console.warn(err);
    		toastr.error(err.statusText);
    	})
    }


    // Detection IE
    var ua = navigator.userAgent;
    console.log(ua);
    var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
    if(is_ie)
    	$rootScope.msie=true;
    

});




myApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/accueil", {
			templateUrl:"/accueil",
			controller:"accueilCtrl",
			cache: true
		})
		.when("/commande", {
			templateUrl:"/commande",
			controller:"commandeCtrl",
			cache: true
		})
		.when("/paiement", {
			templateUrl:"/paiement",
			controller:"paiementCtrl",
			cache: true
		})
		.when("/reglement", {
			templateUrl:"/reglement",
			controller:"reglementCtrl",
			cache: true
		})
		.when("/validation", {
			templateUrl:"/validation",
			controller:"validationCtrl",
			cache: true
		})
		.otherwise({
			redirectTo: "/accueil"
		});

	$routeProvider
		.when("/admin", {
			templateUrl:"/admin",
			controller:"adminCtrl",
			cache: true
		})

		.when("/admin/index", {
			templateUrl:"/admin/index",
			controller:"adminAccueilCtrl",
			cache: true
		});


	$locationProvider
		.html5Mode(true)
		.hashPrefix('!');

});
'use strict';

myApp.controller("adminAccueilCtrl", ['$scope', '$rootScope','$timeout', 'clientService', 'commandeService', 'promotionService', 
	function($scope, $rootScope, $timeout, $clientService, $commandeService, $promotionService){
		
		$scope.promotions = [];
		$scope.clients = [];

		$scope.promotion = {
			entreprise:"",
			reduction:{
				montant:0,
				percent:0
			},valide:true
		};

		$promotionService.getAll().then(function(promotions){
			$scope.promotions = angular.copy(promotions);
		}, function(err){
			console.warn(err);
			toastr.error(err.statusText);
		});


		$clientService.getAll().then(function(clients){
			$scope.clients = angular.copy(clients);
		}, function(err){
			console.warn(err);
			toastr.error(err.statusText);
		});


		$scope.addProm = function(){
			$promotionService.add($scope.promotion).then(function(prom){
				$scope.promotions.push(prom);
				$scope.promotion = {
					entreprise:"",
					reduction:{
						montant:0,
						percent:0
					},valide:true
				};
			}, function(err){
				console.warn(err);
				toastr.error(err.statusText);
			});
		};



		$scope.delProm = function(prom){
			$promotionService.delete(prom).then(function(data){
				var idx = $scope.promotions.indexOf(prom);
				if(idx !== -1)
					$scope.promotions.splice(idx, 1);
			}, function(err){
				console.warn(err);
				toastr.error(err.statusText);
			});
		};



		$scope.modifProm = function(prom){

			$scope.promotion.entreprise = prom.entreprise;
			$scope.promotion.reduction = prom.reduction;

			$promotionService.modif($scope.promotion).then(function(newProm){
				var idx = $scope.promotions.indexOf(prom);
				if(idx !== -1)
					$scope.promotions[idx] = angular.copy(newProm);

				$scope.promotion = {
					entreprise:"",
					reduction:{
						montant:0,
						percent:0
					},valide:true
				};
			}, function(err){
				console.warn(err);
				toastr.error(err.statusText);
			});
		};




}]);
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
      // console.log("save cmd");
      // console.log($scope.commande.zones.length);
      $commandeService.modif($scope.commande._id, $scope.commande).then(
        function(cmd) {
          angular.copy(cmd, $scope.commande);
          $rootScope.go(path);
        },
        function(err) {
          console.warn(err);
          toastr.error(err.statusText);
        }
      );
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

      $timeout(function() {
        $("#listVille").scrollTop($("#listVille > table").height());
        // $scope.apply();
      }, 10);

      $scope.calcTotal();
      $scope.changeMap();
      return;
    };

    $scope.changeMap = function(e) {
      $scope.regions = new Array();

      console.log("TARGGGET", e);

      if ($scope.national) {
        $scope["ouest"] = true;
        $scope["nord"] = true;
        $scope["est"] = true;
        $scope["sud-est"] = true;
        $scope["sud"] = true;
        $scope["sud-ouest"] = true;
      } else if (e && e.target.id == "national") {
        $scope["ouest"] = false;
        $scope["nord"] = false;
        $scope["est"] = false;
        $scope["sud-est"] = false;
        $scope["sud"] = false;
        $scope["sud-ouest"] = false;
      }

      if ($scope["ouest"]) $scope.regions.push("ouest");
      if ($scope["nord"]) $scope.regions.push("nord");
      if ($scope["est"]) $scope.regions.push("est");
      if ($scope["sud-est"]) $scope.regions.push("sud-est");
      if ($scope["sud"]) $scope.regions.push("sud");
      if ($scope["sud-ouest"]) $scope.regions.push("sud-ouest");

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
      if (name === "est") $scope["est"] = true;
      if (name === "sud-est") $scope["sud-est"] = true;
      if (name === "sud") $scope["sud"] = true;
      if (name === "sud-ouest") $scope["sud-ouest"] = true;

      if (
        $scope["ouest"] &&
        $scope["nord"] &&
        $scope["est"] &&
        $scope["sud-est"] &&
        $scope["sud"] &&
        $scope["sud-ouest"]
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
      if (!path || path === undefined) path = $scope.path;
      $clientService
        .modif($scope.client._id, $scope.client)
        .then(function(client) {
          angular.copy(client, $scope.client);
          $rootScope.go(path);
        });
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

"use strict";

myApp.directive("d3Map", [
  "$timeout",
  "$window",
  function($timeout, $window) {
    return {
      restrict: "A",
      scope: {
        map: "@",
        cities: "@",
        regions: "=",
        zonesData: "=",
        width: "@",
        height: "@",
        ctrlAjout: "=",
        ctrlRemove: "=",
        ctrlAjoutMulti: "=",
        ctrlRemoveMulti: "=",
        ctrlRegionActif: "="
      },
      link: function(scope, ele, attrs) {
        // Valeurs par défault

        var margin = { top: 0, right: 0, bottom: 0, left: 0 },
          width = d3.select(ele[0]).node().offsetWidth,
          width = scope.width === undefined ? width : scope.width,
          width = width - margin.left - margin.right,
          height = scope.height === undefined ? 2000 : scope.height,
          height = height - margin.top - margin.bottom,
          map = scope.map === undefined ? "Luxembourg.svg" : scope.map,
          cities = scope.cities === undefined ? "Commune.tsv" : scope.cities,
          regions = scope.regions === undefined ? new Array() : scope.regions;

        scope.data = null;
        scope.zonesData = new Array();
        scope.paths = new Array();

        // var colorCentre = "#5d2491",
        //   colorSud = "#c01a2c",
        //   colorEst = "#3871c2",
        //   colorNord = "#fbbd13";
        // var colorCentre = "#5d2491",
        //   colorSud = "#c01a2c",
        //   colorEst = "#3871c2",
        //   colorNord = "#fbbd13";

        let colorOuest = "#F00000";
        let colorNord = "#0F3D00";
        let colorEst = "#00F024";
        let colorSudEst = "#0D0F1F";
        let colorSud = "#0000F0";
        let colorSudOuest = "#0FD0FF";

        width = d3.select(ele[0]).node().offsetWidth;

        var svg = d3
          .select(ele[0])
          .append("svg")
          .attr("width", width)
          .attr("height", height);

        var formatNumber = d3.format(".1f");

        window.addEventListener("resize", function() {
          width = d3.select(ele[0]).node().offsetWidth;
          svg.attr("width", width);
          d3.select("g").remove();
          scope.render(scope.map);
        });

        scope.$watch(
          "map",
          function(newData, oldValue) {
            scope.render(newData);
          },
          true
        );

        scope.$watch(
          "cities",
          function(newData, oldValue) {
            scope.loadFile(newData);
          },
          true
        );

        scope.$watch(
          "regions",
          function(newData, oldValue) {
            var zoneRemoves = new Array();
            var zoneAjouts = new Array();
            scope.regions = angular.copy(newData);
            var zonesDeja = angular.copy(scope.zonesData);

            if (oldValue === undefined) oldValue = new Array();

            scope.paths.forEach(function(path) {
              var id = path.attr("id");
              var data = scope.data[id];

              var idxZone = zonesDeja
                .map(function(z) {
                  return z["Ville"];
                })
                .indexOf(data["Ville"]);

              if (scope.regions.indexOf("national") !== -1 && idxZone === -1) {
                zonesDeja.push(data);
                zoneAjouts.push(data);
              } else if (
                scope.regions.indexOf(data["region"]) !== -1 &&
                idxZone === -1
              ) {
                zonesDeja.push(data);
                zoneAjouts.push(data);
              } else if (
                oldValue.indexOf(data["region"]) !== -1 &&
                scope.regions.indexOf(data["region"]) === -1 &&
                idxZone !== -1
              ) {
                zonesDeja.splice(idxZone, 1);
                zoneRemoves.push(data);
              }
            });

            scope.paths.forEach(function(p) {
              var id = p.attr("id");
              var data = scope.data[id];

              if (zonesDeja.length > 0) {
                // Zones sélectionner

                if (
                  zonesDeja
                    .map(function(z) {
                      return z["Ville"];
                    })
                    .indexOf(data["Ville"]) !== -1
                ) {
                  p.attr("class", "pathActive");
                  // if (data["region"] == "Centre / zentrum")
                  //   p.attr("fill", colorCentre);
                  // else if (data["region"] == "Est / osten")
                  //   p.attr("fill", colorEst);
                  // else if (data["region"] == "Sud / suden")
                  //   p.attr("fill", colorSud);
                  // else if (data["region"] == "Nord / norden")
                  //   p.attr("fill", colorNord);
                  if (data["region"] === "ouest") p.attr("fill", colorOuest);
                  if (data["region"] === "nord") p.attr("fill", colorNord);
                  if (data["region"] === "est") p.attr("fill", colorEst);
                  if (data["region"] === "sud-est") p.attr("fill", colorSudEst);
                  if (data["region"] === "sud") p.attr("fill", colorSud);
                  if (data["region"] === "sud-ouest")
                    p.attr("fill", colorSudOuest);
                } else {
                  p.attr("fill", "white").attr("class", "pathRegion");
                }
              }
            });

            // scope.zonesData = angular.copy(zonesDeja);

            // console.log('regionWatch');
            // console.log(zoneAjouts.length)
            // console.log(zoneRemoves.length)

            // ajouts ou suppression dans données

            if (zoneAjouts.length > 0) scope.ctrlAjoutMulti(zoneAjouts);
            if (zoneRemoves.length > 0) scope.ctrlRemoveMulti(zoneRemoves);
          },
          true
        );

        scope.$watch(
          "zonesData",
          function(newData, oldValue) {
            // console.log(oldValue);
            // console.log(newData);
            // console.log(scope.zonesDataData);

            $timeout(function() {
              var zonesDeja = angular.copy(newData);

              // scope.paths.forEach(function(path){

              // 	var id = path.attr("id");
              // 	var data = scope.data[id];

              // 	if(scope.regions.indexOf('national') !== -1 && scope.zonesData.indexOf(data) === -1){
              // 		// pas dans les zones et national
              // 		scope.zonesData.push(data);
              // 	}else if(scope.regions.indexOf(data['region']) !== -1 && scope.zonesData.indexOf(data) === -1){
              // 		// pas dans les zones et dans la region
              // 		scope.zonesData.push(data);
              // 	}else if(oldValue.indexOf(data['region']) !== -1 && scope.zonesData.indexOf(data) !== -1){
              // 		var idx = scope.zonesData.indexOf(data);
              // 		if(idx !== -1){
              // 			scope.zonesData.splice(idx, 1);
              // 		}
              // 	};
              // });

              // Couleur des zones
              scope.paths.forEach(function(p) {
                var id = p.attr("id");
                var data = scope.data[id];
                if (zonesDeja.length > 0) {
                  if (
                    zonesDeja
                      .map(function(z) {
                        return z["Ville"];
                      })
                      .indexOf(data["Ville"]) !== -1
                  ) {
                    p.attr("class", "pathActive");
                    // if (data["region"] == "Centre / zentrum")
                    //   p.attr("fill", colorCentre);
                    // else if (data["region"] == "Est / osten")
                    //   p.attr("fill", colorEst);
                    // else if (data["region"] == "Sud / suden")
                    //   p.attr("fill", colorSud);
                    // else if (data["region"] == "Nord / norden")
                    //   p.attr("fill", colorNord);
                    if (data["region"] === "ouest") p.attr("fill", colorOuest);
                    if (data["region"] === "nord") p.attr("fill", colorNord);
                    if (data["region"] === "est") p.attr("fill", colorEst);
                    if (data["region"] === "sud-est")
                      p.attr("fill", colorSudEst);
                    if (data["region"] === "sud") p.attr("fill", colorSud);
                    if (data["region"] === "sud-ouest")
                      p.attr("fill", colorSudOuest);
                  } else {
                    p.attr("fill", "white").attr("class", "pathRegion");
                  }
                } else {
                  p.attr("fill", "white").attr("class", "pathRegion");
                }
              });

              // Recherche de régions Entierement Actives

              var regions = [
                "ouest",
                "nord",
                "est",
                "sud-est",
                "sud",
                "sud-ouest"
              ];

              regions.forEach(function(reg) {
                console.log("reg");
                var nb = scope.paths.filter(function(path) {
                  var id = path.attr("id");
                  var data = scope.data[id];
                  return data["region"] == reg;
                }).length;

                var nbActif = zonesDeja.filter(function(zone) {
                  return zone["region"] == reg;
                }).length;

                // console.log(reg);
                // console.log(nb);
                // console.log(nbActif);

                if (nb == nbActif && nb > 0 && nbActif > 0)
                  scope.ctrlRegionActif(reg);
              });

              scope.zonesData = angular.copy(zonesDeja);
            }, 200);
          },
          true
        );

        scope.render = function(map) {
          if (map === undefined) return;

          var g = svg.append("g").attr("class", "map");
          $timeout(function() {
            d3.xml(map)
              .mimeType("image/svg+xml")
              .get(function(error, doc) {
                if (error) console.warn(error);

                var elts = Array.from(doc.getElementsByTagName("path"));
                elts = elts.filter(function(p) {
                  return p.getAttribute("id").substr(0, 4) != "path";
                });
                var pathCoords = new Array();

                // Création des elements / Paths
                for (var i = 0; i < elts.length; i++) {
                  var d = elts[i].getAttribute("d"),
                    id = elts[i].getAttribute("id");
                  var path = g
                    .append("path")
                    .attr("d", d)
                    .attr("fill", "white")
                    .classed("top", false)
                    .attr("stroke-width", 2)
                    .attr("stroke", "black")
                    .attr("id", id)
                    .attr("class", "pathRegion");
                  if (!scope.data[id]) debugger;
                  var region = scope.data[id];
                  scope.paths.push(path);
                  // choix des zones

                  if (scope.regions.length > 0 && region !== undefined) {
                    scope.paths.forEach(function(path) {
                      var id = path.attr("id");
                      var data = scope.data[id];

                      if (
                        scope.regions.indexOf("national") !== -1 &&
                        scope.zonesData.indexOf(data) === -1
                      ) {
                        scope.zonesData.push(data);
                      } else if (
                        scope.regions.indexOf(data["region"]) !== -1 &&
                        scope.zonesData.indexOf(data) === -1
                      ) {
                        scope.zonesData.push(data);
                      }
                    });
                  }

                  // Valide la sélection / zones

                  // if(scope.zonesData.length > 0 && region !== undefined){

                  // 	if(scope.zonesData.indexOf(region) !== -1){
                  // 		path.attr("class","pathActive");

                  // 		if(region['region']=="Centre / zentrum")
                  // 			path.attr("fill", colorCentre);
                  // 		else if(region['region']=="Est / osten")
                  // 			path.attr("fill", colorEst);
                  // 		else if(region['region']=="Sud / suden")
                  // 			path.attr("fill", colorSud);
                  // 		else if(region['region']=="Nord / norden")
                  // 			path.attr("fill", colorNord);
                  // 	}
                  // }
                  var box = path.node().getBBox();
                  pathCoords.push(box);
                  var center = {
                    x: box["x"] + box["width"] / 2,
                    y: box["y"] + box["height"] / 2
                  };
                  path
                    .append("circle")
                    .attr("cx", center["x"])
                    .attr("cy", center["y"])
                    .attr("r", "4px")
                    .attr("fill", "black")
                    .classed("top", true);
                }

                // Recherche de régions Entierement Actives

                // var regions = new Array(
                //   "Centre / zentrum",
                //   "Est / osten",
                //   "Sud / suden",
                //   "Nord / norden"
                // );

                var regions = [
                  "ouest",
                  "nord",
                  "est",
                  "sud-est",
                  "sud",
                  "sud-ouest"
                ];

                regions.forEach(function(reg) {
                  var nb = scope.paths.filter(function(path) {
                    var id = path.attr("id");
                    var data = scope.data[id];
                    if (!data) debugger;
                    return data["region"] == reg;
                  }).length;
                  var nbActif = scope.zonesData.filter(function(zone) {
                    return zone["region"] == reg;
                  });
                  if (nb == nbActif) scope.ctrlRegionActif(reg);
                });

                // Translation du SVG au min des axes -0.5 %

                var minY = d3.min(
                  pathCoords.map(function(p) {
                    return p["y"];
                  })
                );

                var minX = d3.min(
                  pathCoords.map(function(p) {
                    return p["x"];
                  })
                );

                g.attr(
                  "transform",
                  "translate(" +
                    minX * -0.9 +
                    ",-" +
                    minY * 0.1 +
                    ") scale(0.95,1)"
                );

                // Positionnement du cadre à +20 %

                var maxY = d3.max(
                  pathCoords.map(function(p) {
                    return p["y"] + p["height"];
                  })
                );

                var maxX = d3.max(
                  pathCoords.map(function(p) {
                    return p["x"] + p["width"];
                  })
                );

                var rect = g
                  .append("rect")
                  .attr("x", maxX * 0.8)
                  .attr("y", maxY / 5)
                  .attr("width", maxX * 0.4)
                  .attr("height", maxY * 0.2)
                  .attr("stroke", "grey")
                  .attr("fill", "none")
                  .attr("rx", "8")
                  .attr("ry", "8")
                  .attr("stroke-width", 3);

                // Ligne liant le cadre & le path

                var line = g
                  .append("line")
                  .attr("x1", center["x"])
                  .attr("y1", center["y"])
                  .attr("x2", rect.attr("x"))
                  .attr(
                    "y2",
                    parseInt(rect.attr("y")) + parseInt(rect.attr("height") / 2)
                  )
                  .attr("stroke-width", 3)
                  .attr("stroke", "grey");
                // .attr("transform", function(d, i) { return "scale(" + (1 - d / 25) * 20 + ")"; });

                var data = angular.copy(region);
                // Gestion du texte dans le cadre
                var x = parseInt(rect.attr("x")),
                  y = parseInt(rect.attr("y")),
                  w = parseInt(rect.attr("width")),
                  h = parseInt(rect.attr("height"));
                var ville = g
                  .append("text")
                  .attr("x", x + 15)
                  .attr("y", y + 35)
                  .attr("font-size", "30px")
                  .text(data["Ville"])
                  .attr("fill", "black");
                var region = g
                  .append("text")
                  .attr("x", x + 15)
                  .attr("y", y + 65)
                  .attr("font-size", "20px")
                  .text(data["region"])
                  .attr("fill", "black");
                var brut = g
                  .append("text")
                  .attr("x", x + 15)
                  .attr("y", y + 105)
                  .attr("font-size", "30px")
                  .text(data["brut"])
                  .attr("fill", "black");
                var net = g
                  .append("text")
                  .attr("x", x + 15)
                  .attr("y", y + 135)
                  .attr("font-size", "30px")
                  .text(data["net"])
                  .attr("fill", "black");

                // if (data["region"] == "Centre / zentrum")
                //   region.attr("fill", colorCentre);
                // else if (data["region"] == "Est / osten")
                //   region.attr("fill", colorEst);
                // else if (data["region"] == "Sud / suden")
                //   region.attr("fill", colorSud);
                // else if (data["region"] == "Nord / norden")
                //   region.attr("fill", colorNord);

                if (data["region"] === "ouest") region.attr("fill", colorOuest);
                if (data["region"] === "nord") region.attr("fill", colorNord);
                if (data["region"] === "est") region.attr("fill", colorEst);
                if (data["region"] === "sud-est")
                  region.attr("fill", colorSudEst);
                if (data["region"] === "sud") region.attr("fill", colorSud);
                if (data["region"] === "sud-ouest")
                  region.attr("fill", colorSudOuest);

                // Association des datas

                // Gestion de la souris

                g.selectAll("path")
                  .on("mouseover", function(d, i) {
                    d3.select(this).attr("fill", "orange");
                    var circle = d3.select(this).select("circle");
                    line
                      .attr("x1", circle.attr("cx"))
                      .attr("y1", circle.attr("cy"));
                    var id = d3.select(this).attr("id");
                    var txt = "";

                    if (Object.keys(scope.data).indexOf(id) !== -1) {
                      var d = scope.data[id];
                      var villeName = d["Ville"].replace("_", " ");
                      villeName =
                        villeName[0].toUpperCase() + villeName.substr(1);
                      //
                      // villeName = region.text(d["region"]);
                      // villeName[0].toUpperCase() + villeName.substr(1);

                      ville.text(villeName);
                      brut.text("Brut : " + d["brut"]);
                      net.text("Net : " + d["net"]);
                      // if (d["region"] == "Centre / zentrum")
                      //   d3.select(this).attr("fill", colorCentre);
                      // else if (d["region"] == "Est / osten")
                      //   d3.select(this).attr("fill", colorEst);
                      // else if (d["region"] == "Sud / suden")
                      //   d3.select(this).attr("fill", colorSud);
                      // else if (d["region"] == "Nord / norden")
                      //   d3.select(this).attr("fill", colorNord);

                      if (d["region"] === "ouest")
                        d3.select(this).attr("fill", colorOuest);
                      if (d["region"] === "nord")
                        d3.select(this).attr("fill", colorNord);
                      if (d["region"] === "est")
                        d3.select(this).attr("fill", colorEst);
                      if (d["region"] === "sud-est")
                        d3.select(this).attr("fill", colorSudEst);
                      if (d["region"] === "sud")
                        d3.select(this).attr("fill", colorSud);
                      if (d["region"] === "sud-ouest")
                        d3.select(this).attr("fill", colorSudOuest);

                      // Couleur du texte Région

                      // if (d["region"] == "Centre / zentrum")
                      //   region.attr("fill", colorCentre);
                      // else if (d["region"] == "Est / osten")
                      //   region.attr("fill", colorEst);
                      // else if (d["region"] == "Sud / suden")
                      //   region.attr("fill", colorSud);
                      // else if (d["region"] == "Nord / norden")
                      //   region.attr("fill", colorNord);

                      if (d["region"] === "ouest")
                        region.attr("fill", colorOuest);
                      if (d["region"] === "nord")
                        region.attr("fill", colorNord);
                      if (d["region"] === "est") region.attr("fill", colorEst);
                      if (d["region"] === "sud-est")
                        region.attr("fill", colorSudEst);
                      if (d["region"] === "sud") region.attr("fill", colorSud);
                      if (d["region"] === "sud-ouest")
                        p.attr("fill", colorSudOuest);
                    } else {
                      ville.text(id);
                      region.text("");
                      brut.text("");
                      net.text("");
                    }
                  })
                  .on("mouseout", function(d, i) {
                    if (d3.select(this).attr("class") != "pathActive")
                      d3.select(this).attr("fill", "white");
                  })
                  .on("click", function(d, i) {
                    var id = d3.select(this).attr("id");
                    var data = scope.data[id];

                    if (d3.select(this).attr("class") == "pathActive") {
                      scope.ctrlRemove(data, true);
                      d3.select(this)
                        .attr("class", "pathRegion")
                        .attr("fill", "white");
                    } else {
                      scope.ctrlAjout(data);
                      d3.select(this).attr("class", "pathActive");

                      // if (data["region"] == "Centre / zentrum")
                      //   d3.select(this).attr("fill", colorCentre);
                      // else if (data["region"] == "Est / osten")
                      //   d3.select(this).attr("fill", colorEst);
                      // else if (data["region"] == "Sud / suden")
                      //   d3.select(this).attr("fill", colorSud);
                      // else if (data["region"] == "Nord / norden")
                      //   d3.select(this).attr("fill", colorNord);

                      if (d["region"] === "ouest")
                        d3.select(this).attr("fill", colorOuest);
                      if (d["region"] === "nord")
                        d3.select(this).attr("fill", colorNord);
                      if (d["region"] === "est")
                        d3.select(this).attr("fill", colorEst);
                      if (d["region"] === "sud-est")
                        d3.select(this).attr("fill", colorSudEst);
                      if (d["region"] === "sud")
                        d3.select(this).attr("fill", colorSud);
                      if (d["region"] === "sud-ouest")
                        d3.select(this).attr("fill", colorSudOuest);
                    }
                  });
              });
          }, 0);
        };

        scope.loadFile = function(file) {
          d3.csv(file, function(data) {
            scope.data = {};
            data.forEach(function(d) {
              scope.data[d["Ville"]] = d;
            });
          });
        };
      }
    };
  }
]);

'use strict';

angular.module('client.services', [])
	.service("clientService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/client/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			getAll:function(){
				return $http.post("/api/client/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			getMe:function(){
				return $http.get("/api/client/getMe").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(coordonnee){
				return $http.put("/api/client/", {coordonnee:coordonnee}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(clientId, coordonnee){
				return $http.patch("/api/client/", {clientId:clientId, coordonnee:coordonnee}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			changeLang:function(lang){
				return $http.patch("/api/client/lang", {lang:lang}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			loadLang:function(){
				return $http.get("/api/client/lang").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}

		}
	}]);
'use strict';

angular.module('commande.services', [])
	.service("commandeService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/commande/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			getMe:function(){
				return $http.get("/api/commande/getMe").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			modif:function(commandeId, commande){
				return $http.patch("/api/commande/", {commandeId:commandeId, commande:commande}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			clear:function(){
				return $http.get("/api/commande/clear").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			email:function(){
				return $http.get("/api/commande/email").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('paiement.services', [])
	.service("paiementService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/paiement", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(paiement){
				return $http.put("/api/paiement", {paiement:paiement}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(paiement){
				return $http.patch("/api/paiement", {paiement:paiement}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			saveCard:function(card){
				return $http.put("/api/paiement/card", {card:card}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			getCard:function(){
				return $http.post("/api/paiement/card").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

		}
	}]);
'use strict';

angular.module('promotion.services', [])
	.service("promotionService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/promotion/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			getAll:function(){
				return $http.post("/api/promotion/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			add:function(promotion){
				return $http.put("/api/promotion/", {promotion:promotion}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			modif:function(promotion){
				return $http.patch("/api/promotion/", {promotion:promotion}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			delete:function(promotion){
				return $http.delete("/api/promotion/?promId="+promotion._id).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},
		}
	}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcENvbmZpZy5qcyIsImNvbnRyb2xsZXIvYWRtaW5DdHJsLmpzIiwiY29udHJvbGxlci9jbGllbnRDdHJsLmpzIiwiZGlyZWN0aXZlcy9tYXBEaXJlY3RpdmUuanMiLCJzZXJ2aWNlcy9jbGllbnQuanMiLCJzZXJ2aWNlcy9jb21tYW5kZS5qcyIsInNlcnZpY2VzL3BhaWVtZW50LmpzIiwic2VydmljZXMvcHJvbW90aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cblxuXG52YXIgbXlBcHAgPSBhbmd1bGFyLm1vZHVsZShcImRpc3RyYWxzYVwiLCBbJ25nQW5pbWF0ZScsJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZScsICduZ0RpYWxvZycsIFxuXHRcdCduZ01hdGVyaWFsJywgJ25nQ29va2llcycsICduZ1Nhbml0aXplJywgJ25nQ3N2JywgJ2NsaWVudC5zZXJ2aWNlcycsICdjb21tYW5kZS5zZXJ2aWNlcycsICdwYWllbWVudC5zZXJ2aWNlcycsICdwcm9tb3Rpb24uc2VydmljZXMnXSk7XG5cblxubXlBcHAuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsIGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcblx0JGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbltcIlgtUmVxdWVzdGVkLVdpdGhcIl0gPSAgJ1hNTEh0dHBSZXF1ZXN0Jztcblx0JGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbltcIkNvbnRlbnQtVHlwZVwiXSA9ICAnYXBwbGljYXRpb24vanNvbic7XG5cblx0aWYgKCEkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuZ2V0KVxuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuZ2V0ID0ge307XG5cblx0JGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmdldFsnSWYtTW9kaWZpZWQtU2luY2UnXSA9ICcwJztcblx0JGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmdldFsnQ2FjaGUtQ29udHJvbCddID0gJ25vLWNhY2hlJztcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuZ2V0WydQcmFnbWEnXSA9ICduby1jYWNoZSc7XG5cblxufV0pO1xuXG5cblxubXlBcHAuY29uZmlnKFsnJG1kQXJpYVByb3ZpZGVyJywgZnVuY3Rpb24oJG1kQXJpYVByb3ZpZGVyKSB7XG4gICAvLyBHbG9iYWxseSBkaXNhYmxlcyBhbGwgQVJJQSB3YXJuaW5ncy5cbiAgICRtZEFyaWFQcm92aWRlci5kaXNhYmxlV2FybmluZ3MoKTtcbn1dKTtcblxuXG5cbm15QXBwLmNvbmZpZyhmdW5jdGlvbigkbWRJY29uUHJvdmlkZXIpIHtcblx0JG1kSWNvblByb3ZpZGVyXG5cdFx0Lmljb25TZXQoXCJjYWxsXCIsICdpY29ucy9zZXRzL2NvbW11bmljYXRpb24taWNvbnMuc3ZnJywgMjQpXG5cdFx0Lmljb25TZXQoXCJzb2NpYWxcIiwgJ2ljb25zL3NldHMvc29jaWFsLWljb25zLnN2ZycsIDI0KTtcbn0pO1xuXG5cblxuXG5cbm15QXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkdGVtcGxhdGVDYWNoZSwgJGxvY2F0aW9uLCAkZG9jdW1lbnQsIGNsaWVudFNlcnZpY2UsIGNvbW1hbmRlU2VydmljZSkge1xuXG5cdCRyb290U2NvcGUubG9hZGluZyA9ICBmYWxzZTtcblx0JHJvb3RTY29wZS5ldmVudCA9ICBmYWxzZTtcblx0JHJvb3RTY29wZS5uZXh0ID0gIGZhbHNlO1xuXHQkcm9vdFNjb3BlLmRyYXBlYXUgPSAgXCJzdmcvZnIuc3ZnXCI7XG5cdCRyb290U2NvcGUubGFuZyA9ICBcImZyXCI7XG5cdCRyb290U2NvcGUubGFuZ0RhdGEgPSAgW107XG5cdCRyb290U2NvcGUuY3VycmVudCA9ICBmYWxzZTtcblx0JHJvb3RTY29wZS5tc2llPWZhbHNlO1xuXG5cblx0Y2xpZW50U2VydmljZS5sb2FkTGFuZygpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG5cdFx0JHJvb3RTY29wZS5sYW5nRGF0YSA9IGRhdGEubGFuZ3M7XG5cdFx0JHJvb3RTY29wZS5sYW5nID0gZGF0YS5jbGllbnQubGFuZztcblx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRjb25zb2xlLndhcm4oZXJyKTtcblx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuXHR9KTtcblxuXHQkcm9vdFNjb3BlLiRvbihcIiRsb2NhdGlvbkNoYW5nZVN0YXJ0XCIsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0JHJvb3RTY29wZS5sb2FkaW5nID0gdHJ1ZTtcblx0XHR2YXIgaG9zdE5hbWUgPSAkbG9jYXRpb24ucHJvdG9jb2woKStcIjovL1wiKyRsb2NhdGlvbi5ob3N0KCkrXCIvXCI7XG5cblx0XHQkcm9vdFNjb3BlLmV2ZW50ID0gZXZlbnQ7XG5cdFx0JHJvb3RTY29wZS5uZXh0ID0gbmV4dC5yZXBsYWNlKGhvc3ROYW1lLCBcIlwiKTtcblx0XHQkcm9vdFNjb3BlLmN1cnJlbnQgPSBjdXJyZW50LnJlcGxhY2UoaG9zdE5hbWUsIFwiXCIpO1xuXG5cdFx0JHJvb3RTY29wZS5uZXh0ID0gJHJvb3RTY29wZS5uZXh0ID09IFwiXCIgPyBcImFjY3VlaWxcIiA6ICRyb290U2NvcGUubmV4dDtcblx0XHQkcm9vdFNjb3BlLmN1cnJlbnQgPSAkcm9vdFNjb3BlLmN1cnJlbnQgPT0gXCJcIiA/IFwiYWNjdWVpbFwiIDogJHJvb3RTY29wZS5jdXJyZW50O1xuXG5cblx0fSk7XG5cblxuXHQkcm9vdFNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG5cdFx0JHRlbXBsYXRlQ2FjaGUucmVtb3ZlQWxsKCk7XG5cdFx0JHJvb3RTY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdH0pO1xuXG5cblx0JHJvb3RTY29wZS5nbyA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdFx0JGxvY2F0aW9uLnBhdGgocGF0aCk7XG5cdH07XG5cblxuXHR2YXIgb3JpZ2luYXRvckV2O1xuXHQkcm9vdFNjb3BlLm9wZW5NZW51ID0gZnVuY3Rpb24oJG1kTWVudSwgZXYpIHtcbiAgICAgIG9yaWdpbmF0b3JFdiA9IGV2O1xuICAgICAgJG1kTWVudS5vcGVuKGV2KTtcbiAgICB9O1xuXG5cblxuICAgICRyb290U2NvcGUuY2hhbmdlTGFuZyA9IGZ1bmN0aW9uKGV2LCBsYW5nKXtcblxuICAgIFx0JHJvb3RTY29wZS5sYW5nID0gbGFuZztcblxuICAgIFx0Y2xpZW50U2VydmljZS5jaGFuZ2VMYW5nKGxhbmcpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgXHRcdCRyb290U2NvcGUubGFuZ0RhdGEgPSBkYXRhLmxhbmdzO1xuICAgIFx0XHQkcm9vdFNjb3BlLmxhbmcgPSBkYXRhLmNsaWVudC5sYW5nO1xuICAgIFx0fSwgZnVuY3Rpb24oZXJyKXtcbiAgICBcdFx0Y29uc29sZS53YXJuKGVycik7XG4gICAgXHRcdHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgXHR9KVxuICAgIH1cblxuXG4gICAgLy8gRGV0ZWN0aW9uIElFXG4gICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICBjb25zb2xlLmxvZyh1YSk7XG4gICAgdmFyIGlzX2llID0gdWEuaW5kZXhPZihcIk1TSUUgXCIpID4gLTEgfHwgdWEuaW5kZXhPZihcIlRyaWRlbnQvXCIpID4gLTE7XG4gICAgaWYoaXNfaWUpXG4gICAgXHQkcm9vdFNjb3BlLm1zaWU9dHJ1ZTtcbiAgICBcblxufSk7XG5cblxuXG5cbm15QXBwLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0JHJvdXRlUHJvdmlkZXJcblx0XHQud2hlbihcIi9hY2N1ZWlsXCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL2FjY3VlaWxcIixcblx0XHRcdGNvbnRyb2xsZXI6XCJhY2N1ZWlsQ3RybFwiLFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9KVxuXHRcdC53aGVuKFwiL2NvbW1hbmRlXCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL2NvbW1hbmRlXCIsXG5cdFx0XHRjb250cm9sbGVyOlwiY29tbWFuZGVDdHJsXCIsXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0pXG5cdFx0LndoZW4oXCIvcGFpZW1lbnRcIiwge1xuXHRcdFx0dGVtcGxhdGVVcmw6XCIvcGFpZW1lbnRcIixcblx0XHRcdGNvbnRyb2xsZXI6XCJwYWllbWVudEN0cmxcIixcblx0XHRcdGNhY2hlOiB0cnVlXG5cdFx0fSlcblx0XHQud2hlbihcIi9yZWdsZW1lbnRcIiwge1xuXHRcdFx0dGVtcGxhdGVVcmw6XCIvcmVnbGVtZW50XCIsXG5cdFx0XHRjb250cm9sbGVyOlwicmVnbGVtZW50Q3RybFwiLFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9KVxuXHRcdC53aGVuKFwiL3ZhbGlkYXRpb25cIiwge1xuXHRcdFx0dGVtcGxhdGVVcmw6XCIvdmFsaWRhdGlvblwiLFxuXHRcdFx0Y29udHJvbGxlcjpcInZhbGlkYXRpb25DdHJsXCIsXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0pXG5cdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRyZWRpcmVjdFRvOiBcIi9hY2N1ZWlsXCJcblx0XHR9KTtcblxuXHQkcm91dGVQcm92aWRlclxuXHRcdC53aGVuKFwiL2FkbWluXCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL2FkbWluXCIsXG5cdFx0XHRjb250cm9sbGVyOlwiYWRtaW5DdHJsXCIsXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0pXG5cblx0XHQud2hlbihcIi9hZG1pbi9pbmRleFwiLCB7XG5cdFx0XHR0ZW1wbGF0ZVVybDpcIi9hZG1pbi9pbmRleFwiLFxuXHRcdFx0Y29udHJvbGxlcjpcImFkbWluQWNjdWVpbEN0cmxcIixcblx0XHRcdGNhY2hlOiB0cnVlXG5cdFx0fSk7XG5cblxuXHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdC5odG1sNU1vZGUodHJ1ZSlcblx0XHQuaGFzaFByZWZpeCgnIScpO1xuXG59KTsiLCIndXNlIHN0cmljdCc7XG5cbm15QXBwLmNvbnRyb2xsZXIoXCJhZG1pbkFjY3VlaWxDdHJsXCIsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCckdGltZW91dCcsICdjbGllbnRTZXJ2aWNlJywgJ2NvbW1hbmRlU2VydmljZScsICdwcm9tb3Rpb25TZXJ2aWNlJywgXG5cdGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsICRjbGllbnRTZXJ2aWNlLCAkY29tbWFuZGVTZXJ2aWNlLCAkcHJvbW90aW9uU2VydmljZSl7XG5cdFx0XG5cdFx0JHNjb3BlLnByb21vdGlvbnMgPSBbXTtcblx0XHQkc2NvcGUuY2xpZW50cyA9IFtdO1xuXG5cdFx0JHNjb3BlLnByb21vdGlvbiA9IHtcblx0XHRcdGVudHJlcHJpc2U6XCJcIixcblx0XHRcdHJlZHVjdGlvbjp7XG5cdFx0XHRcdG1vbnRhbnQ6MCxcblx0XHRcdFx0cGVyY2VudDowXG5cdFx0XHR9LHZhbGlkZTp0cnVlXG5cdFx0fTtcblxuXHRcdCRwcm9tb3Rpb25TZXJ2aWNlLmdldEFsbCgpLnRoZW4oZnVuY3Rpb24ocHJvbW90aW9ucyl7XG5cdFx0XHQkc2NvcGUucHJvbW90aW9ucyA9IGFuZ3VsYXIuY29weShwcm9tb3Rpb25zKTtcblx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0Y29uc29sZS53YXJuKGVycik7XG5cdFx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuXHRcdH0pO1xuXG5cblx0XHQkY2xpZW50U2VydmljZS5nZXRBbGwoKS50aGVuKGZ1bmN0aW9uKGNsaWVudHMpe1xuXHRcdFx0JHNjb3BlLmNsaWVudHMgPSBhbmd1bGFyLmNvcHkoY2xpZW50cyk7XG5cdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdGNvbnNvbGUud2FybihlcnIpO1xuXHRcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0XHR9KTtcblxuXG5cdFx0JHNjb3BlLmFkZFByb20gPSBmdW5jdGlvbigpe1xuXHRcdFx0JHByb21vdGlvblNlcnZpY2UuYWRkKCRzY29wZS5wcm9tb3Rpb24pLnRoZW4oZnVuY3Rpb24ocHJvbSl7XG5cdFx0XHRcdCRzY29wZS5wcm9tb3Rpb25zLnB1c2gocHJvbSk7XG5cdFx0XHRcdCRzY29wZS5wcm9tb3Rpb24gPSB7XG5cdFx0XHRcdFx0ZW50cmVwcmlzZTpcIlwiLFxuXHRcdFx0XHRcdHJlZHVjdGlvbjp7XG5cdFx0XHRcdFx0XHRtb250YW50OjAsXG5cdFx0XHRcdFx0XHRwZXJjZW50OjBcblx0XHRcdFx0XHR9LHZhbGlkZTp0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRjb25zb2xlLndhcm4oZXJyKTtcblx0XHRcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblxuXG5cdFx0JHNjb3BlLmRlbFByb20gPSBmdW5jdGlvbihwcm9tKXtcblx0XHRcdCRwcm9tb3Rpb25TZXJ2aWNlLmRlbGV0ZShwcm9tKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0XHR2YXIgaWR4ID0gJHNjb3BlLnByb21vdGlvbnMuaW5kZXhPZihwcm9tKTtcblx0XHRcdFx0aWYoaWR4ICE9PSAtMSlcblx0XHRcdFx0XHQkc2NvcGUucHJvbW90aW9ucy5zcGxpY2UoaWR4LCAxKTtcblx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdGNvbnNvbGUud2FybihlcnIpO1xuXHRcdFx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXG5cblx0XHQkc2NvcGUubW9kaWZQcm9tID0gZnVuY3Rpb24ocHJvbSl7XG5cblx0XHRcdCRzY29wZS5wcm9tb3Rpb24uZW50cmVwcmlzZSA9IHByb20uZW50cmVwcmlzZTtcblx0XHRcdCRzY29wZS5wcm9tb3Rpb24ucmVkdWN0aW9uID0gcHJvbS5yZWR1Y3Rpb247XG5cblx0XHRcdCRwcm9tb3Rpb25TZXJ2aWNlLm1vZGlmKCRzY29wZS5wcm9tb3Rpb24pLnRoZW4oZnVuY3Rpb24obmV3UHJvbSl7XG5cdFx0XHRcdHZhciBpZHggPSAkc2NvcGUucHJvbW90aW9ucy5pbmRleE9mKHByb20pO1xuXHRcdFx0XHRpZihpZHggIT09IC0xKVxuXHRcdFx0XHRcdCRzY29wZS5wcm9tb3Rpb25zW2lkeF0gPSBhbmd1bGFyLmNvcHkobmV3UHJvbSk7XG5cblx0XHRcdFx0JHNjb3BlLnByb21vdGlvbiA9IHtcblx0XHRcdFx0XHRlbnRyZXByaXNlOlwiXCIsXG5cdFx0XHRcdFx0cmVkdWN0aW9uOntcblx0XHRcdFx0XHRcdG1vbnRhbnQ6MCxcblx0XHRcdFx0XHRcdHBlcmNlbnQ6MFxuXHRcdFx0XHRcdH0sdmFsaWRlOnRydWVcblx0XHRcdFx0fTtcblx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdGNvbnNvbGUud2FybihlcnIpO1xuXHRcdFx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXG5cblxufV0pOyIsIlwidXNlIHN0cmljdFwiO1xuXG5teUFwcC5jb250cm9sbGVyKFwiYWNjdWVpbEN0cmxcIiwgW1xuICBcIiRzY29wZVwiLFxuICBcIiRyb290U2NvcGVcIixcbiAgXCIkdGltZW91dFwiLFxuICBcImNsaWVudFNlcnZpY2VcIixcbiAgXCJjb21tYW5kZVNlcnZpY2VcIixcbiAgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgJGNsaWVudFNlcnZpY2UsICRjb21tYW5kZVNlcnZpY2UpIHtcbiAgICAkc2NvcGUuem9uZXMgPSBuZXcgQXJyYXkoKTtcbiAgICAkc2NvcGUucmVnaW9ucyA9IG5ldyBBcnJheSgpO1xuICAgICgkc2NvcGUuc3VtTmV0ID0gMCksICgkc2NvcGUuc3VtQnJ1dCA9IDApLCAoJHNjb3BlLnRvdGFsID0gMCk7XG4gICAgJHNjb3BlLmNvbW1hbmRlID0ge307XG4gICAgJHNjb3BlLmlzT3RoZXIgPSBmYWxzZTtcbiAgICBjb25zb2xlLmxvZygkc2NvcGUuaXNPdGhlcik7XG5cbiAgICAkY2xpZW50U2VydmljZS5nZXRNZSgpLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXApIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHNjb3BlLmNsaWVudCA9IHJlcC5jbGllbnQ7XG4gICAgICAgICAgJHNjb3BlLmNvbW1hbmRlID0gcmVwLmNvbW1hbmRlO1xuICAgICAgICAgICRzY29wZS56b25lcyA9IHJlcC5jb21tYW5kZS56b25lcy5tYXAoZnVuY3Rpb24oem9uZSkge1xuICAgICAgICAgICAgdmFyIHZpbGxlTmFtZSA9IHpvbmVbXCJWaWxsZVwiXS5yZXBsYWNlKFwiX1wiLCBcIiBcIik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBWaWxsZTogem9uZVtcIlZpbGxlXCJdLFxuICAgICAgICAgICAgICBuYW1lOiB2aWxsZU5hbWVbMF0udG9VcHBlckNhc2UoKSArIHZpbGxlTmFtZS5zdWJzdHIoMSksXG4gICAgICAgICAgICAgIHJlZ2lvbjogem9uZVtcInJlZ2lvblwiXSxcbiAgICAgICAgICAgICAgYnJ1dDogem9uZVtcImJydXRcIl0sXG4gICAgICAgICAgICAgIG5ldDogem9uZVtcIm5ldFwiXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB2YXIgZm9ybWF0ID0gJHNjb3BlLmNvbW1hbmRlLmZvcm1hdDtcbiAgICAgICAgICBpZiAoZm9ybWF0ICE9IFwiQTRcIiAmJiBmb3JtYXQgIT0gXCJBNVwiICYmIGZvcm1hdCAhPSBcIkE2XCIpXG4gICAgICAgICAgICAkc2NvcGUuZm9ybWF0QXV0cmUgPSBmb3JtYXQ7XG4gICAgICAgICAgJHNjb3BlLmNhbGNTdW0oKTtcbiAgICAgICAgICBydW5EYXRlcGlja2VyKCk7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9LCAxNTApO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgdG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgJHNjb3BlLmNhbGNUb3RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJjYWxjIFRvdGFsXCIpO1xuICAgICAgLy8gY29uc29sZS5sb2coJHNjb3BlLmNvbW1hbmRlLnpvbmVzLmxlbmd0aCk7XG4gICAgICAkY29tbWFuZGVTZXJ2aWNlLm1vZGlmKCRzY29wZS5jb21tYW5kZS5faWQsICRzY29wZS5jb21tYW5kZSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oY21kKSB7XG4gICAgICAgICAgJHNjb3BlLmNvbW1hbmRlLnRvdGFsID0gY21kLnRvdGFsO1xuICAgICAgICAgICRzY29wZS5jb21tYW5kZS50b3RhbEhUID0gY21kLnRvdGFsSFQ7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlQ29tbWFuZGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInNhdmUgY21kXCIpO1xuICAgICAgLy8gY29uc29sZS5sb2coJHNjb3BlLmNvbW1hbmRlLnpvbmVzLmxlbmd0aCk7XG4gICAgICAkY29tbWFuZGVTZXJ2aWNlLm1vZGlmKCRzY29wZS5jb21tYW5kZS5faWQsICRzY29wZS5jb21tYW5kZSkudGhlbihcbiAgICAgICAgZnVuY3Rpb24oY21kKSB7XG4gICAgICAgICAgYW5ndWxhci5jb3B5KGNtZCwgJHNjb3BlLmNvbW1hbmRlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmdvKHBhdGgpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWpvdXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdmlsbGVOYW1lID0gZGF0YVtcIlZpbGxlXCJdLnJlcGxhY2UoXCJfXCIsIFwiIFwiKTtcbiAgICAgIGRhdGFbXCJuYW1lXCJdID0gdmlsbGVOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB2aWxsZU5hbWUuc3Vic3RyKDEpO1xuICAgICAgJHNjb3BlLnpvbmVzLnB1c2goZGF0YSk7XG4gICAgICAkc2NvcGUuY29tbWFuZGUuem9uZXMgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnpvbmVzKTtcbiAgICAgICRzY29wZS5jYWxjU3VtKCk7XG4gICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgICRzY29wZS5ham91dE11bHRpID0gZnVuY3Rpb24oZGF0YSwgYXBwbHkpIHtcbiAgICAgIGlmIChhcHBseSA9PSB1bmRlZmluZWQpIGFwcGx5ID0gZmFsc2U7XG5cbiAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgIHZhciB2aWxsZU5hbWUgPSBkW1wiVmlsbGVcIl0ucmVwbGFjZShcIl9cIiwgXCIgXCIpO1xuICAgICAgICBkW1wibmFtZVwiXSA9IHZpbGxlTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgdmlsbGVOYW1lLnN1YnN0cigxKTtcblxuICAgICAgICB2YXIgaWR4ID0gJHNjb3BlLnpvbmVzXG4gICAgICAgICAgLm1hcChmdW5jdGlvbih6b24pIHtcbiAgICAgICAgICAgIHJldHVybiB6b25bXCJWaWxsZVwiXTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5pbmRleE9mKGRbXCJWaWxsZVwiXSk7XG5cbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpICRzY29wZS56b25lcy5wdXNoKGQpO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuY29tbWFuZGUuem9uZXMgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnpvbmVzKTtcbiAgICAgICRzY29wZS5jYWxjU3VtKCk7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgICRzY29wZS5yZW1vdmUgPSBmdW5jdGlvbihkYXRhLCBhcHBseSkge1xuICAgICAgaWYgKGFwcGx5ID09IHVuZGVmaW5lZCkgYXBwbHkgPSBmYWxzZTtcbiAgICAgIHZhciBpZHggPSAkc2NvcGUuem9uZXNcbiAgICAgICAgLm1hcChmdW5jdGlvbih6b24pIHtcbiAgICAgICAgICByZXR1cm4gem9uW1wiVmlsbGVcIl07XG4gICAgICAgIH0pXG4gICAgICAgIC5pbmRleE9mKGRhdGFbXCJWaWxsZVwiXSk7XG4gICAgICBpZiAoaWR4ICE9PSAtMSkgJHNjb3BlLnpvbmVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgJHNjb3BlLmNvbW1hbmRlLnpvbmVzID0gYW5ndWxhci5jb3B5KCRzY29wZS56b25lcyk7XG4gICAgICAkc2NvcGUuY2FsY1N1bSgpO1xuICAgICAgaWYgKGFwcGx5KSAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgICRzY29wZS5yZW1vdmVNdWx0aSA9IGZ1bmN0aW9uKGRhdGEsIGFwcGx5KSB7XG4gICAgICBpZiAoYXBwbHkgPT0gdW5kZWZpbmVkKSBhcHBseSA9IGZhbHNlO1xuXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgaWR4ID0gJHNjb3BlLnpvbmVzXG4gICAgICAgICAgLm1hcChmdW5jdGlvbih6b24pIHtcbiAgICAgICAgICAgIHJldHVybiB6b25bXCJWaWxsZVwiXTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5pbmRleE9mKGRbXCJWaWxsZVwiXSk7XG4gICAgICAgIGlmIChpZHggIT09IC0xKSAkc2NvcGUuem9uZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5jb21tYW5kZS56b25lcyA9IGFuZ3VsYXIuY29weSgkc2NvcGUuem9uZXMpO1xuICAgICAgJHNjb3BlLmNhbGNTdW0oKTtcbiAgICAgIGlmIChhcHBseSkgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICAkc2NvcGUuY2FsY1N1bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzY29wZS56b25lcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAkc2NvcGUuc3VtQnJ1dCA9IDA7XG4gICAgICAgICRzY29wZS5zdW1OZXQgPSAwO1xuICAgICAgICAkc2NvcGUuY2FsY1RvdGFsKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnN1bUJydXQgPSAkc2NvcGUuem9uZXNcbiAgICAgICAgLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoY1tcImJydXRcIl0pO1xuICAgICAgICB9KVxuICAgICAgICAucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYSArIGI7XG4gICAgICAgIH0pO1xuICAgICAgJHNjb3BlLnN1bU5ldCA9ICRzY29wZS56b25lc1xuICAgICAgICAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChjW1wibmV0XCJdKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9KTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIjbGlzdFZpbGxlXCIpLnNjcm9sbFRvcCgkKFwiI2xpc3RWaWxsZSA+IHRhYmxlXCIpLmhlaWdodCgpKTtcbiAgICAgICAgLy8gJHNjb3BlLmFwcGx5KCk7XG4gICAgICB9LCAxMCk7XG5cbiAgICAgICRzY29wZS5jYWxjVG90YWwoKTtcbiAgICAgICRzY29wZS5jaGFuZ2VNYXAoKTtcbiAgICAgIHJldHVybjtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNoYW5nZU1hcCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICRzY29wZS5yZWdpb25zID0gbmV3IEFycmF5KCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiVEFSR0dHRVRcIiwgZSk7XG5cbiAgICAgIGlmICgkc2NvcGUubmF0aW9uYWwpIHtcbiAgICAgICAgJHNjb3BlW1wib3Vlc3RcIl0gPSB0cnVlO1xuICAgICAgICAkc2NvcGVbXCJub3JkXCJdID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlW1wiZXN0XCJdID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlW1wic3VkLWVzdFwiXSA9IHRydWU7XG4gICAgICAgICRzY29wZVtcInN1ZFwiXSA9IHRydWU7XG4gICAgICAgICRzY29wZVtcInN1ZC1vdWVzdFwiXSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGUgJiYgZS50YXJnZXQuaWQgPT0gXCJuYXRpb25hbFwiKSB7XG4gICAgICAgICRzY29wZVtcIm91ZXN0XCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcIm5vcmRcIl0gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlW1wiZXN0XCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcInN1ZC1lc3RcIl0gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlW1wic3VkXCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcInN1ZC1vdWVzdFwiXSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoJHNjb3BlW1wib3Vlc3RcIl0pICRzY29wZS5yZWdpb25zLnB1c2goXCJvdWVzdFwiKTtcbiAgICAgIGlmICgkc2NvcGVbXCJub3JkXCJdKSAkc2NvcGUucmVnaW9ucy5wdXNoKFwibm9yZFwiKTtcbiAgICAgIGlmICgkc2NvcGVbXCJlc3RcIl0pICRzY29wZS5yZWdpb25zLnB1c2goXCJlc3RcIik7XG4gICAgICBpZiAoJHNjb3BlW1wic3VkLWVzdFwiXSkgJHNjb3BlLnJlZ2lvbnMucHVzaChcInN1ZC1lc3RcIik7XG4gICAgICBpZiAoJHNjb3BlW1wic3VkXCJdKSAkc2NvcGUucmVnaW9ucy5wdXNoKFwic3VkXCIpO1xuICAgICAgaWYgKCRzY29wZVtcInN1ZC1vdWVzdFwiXSkgJHNjb3BlLnJlZ2lvbnMucHVzaChcInN1ZC1vdWVzdFwiKTtcblxuICAgICAgY29uc29sZS5sb2coXCJSRUdJT05TXCIsICRzY29wZS5yZWdpb25zKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWRkUmVnaW9uID0gZnVuY3Rpb24obmFtZSwgYXBwbHkpIHtcbiAgICAgIGlmIChhcHBseSA9PSB1bmRlZmluZWQpIGFwcGx5ID0gZmFsc2U7XG5cbiAgICAgIC8vIGlmIChuYW1lID09IFwiTm9yZCAvIG5vcmRlblwiKSAkc2NvcGUubm9yZCA9IHRydWU7XG4gICAgICAvLyBpZiAobmFtZSA9PSBcIkVzdCAvIG9zdGVuXCIpICRzY29wZS5lc3QgPSB0cnVlO1xuICAgICAgLy8gaWYgKG5hbWUgPT0gXCJTdWQgLyBzdWRlblwiKSAkc2NvcGUuc3VkID0gdHJ1ZTtcbiAgICAgIC8vIGlmIChuYW1lID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKSAkc2NvcGUuY2VudHJlID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUubG9nKFwiTkFNTU1FXCIsIG5hbWUpO1xuICAgICAgaWYgKG5hbWUgPT09IFwib3Vlc3RcIikgJHNjb3BlW1wib3Vlc3RcIl0gPSB0cnVlO1xuICAgICAgaWYgKG5hbWUgPT09IFwibm9yZFwiKSAkc2NvcGVbXCJub3JkXCJdID0gdHJ1ZTtcbiAgICAgIGlmIChuYW1lID09PSBcImVzdFwiKSAkc2NvcGVbXCJlc3RcIl0gPSB0cnVlO1xuICAgICAgaWYgKG5hbWUgPT09IFwic3VkLWVzdFwiKSAkc2NvcGVbXCJzdWQtZXN0XCJdID0gdHJ1ZTtcbiAgICAgIGlmIChuYW1lID09PSBcInN1ZFwiKSAkc2NvcGVbXCJzdWRcIl0gPSB0cnVlO1xuICAgICAgaWYgKG5hbWUgPT09IFwic3VkLW91ZXN0XCIpICRzY29wZVtcInN1ZC1vdWVzdFwiXSA9IHRydWU7XG5cbiAgICAgIGlmIChcbiAgICAgICAgJHNjb3BlW1wib3Vlc3RcIl0gJiZcbiAgICAgICAgJHNjb3BlW1wibm9yZFwiXSAmJlxuICAgICAgICAkc2NvcGVbXCJlc3RcIl0gJiZcbiAgICAgICAgJHNjb3BlW1wic3VkLWVzdFwiXSAmJlxuICAgICAgICAkc2NvcGVbXCJzdWRcIl0gJiZcbiAgICAgICAgJHNjb3BlW1wic3VkLW91ZXN0XCJdXG4gICAgICApXG4gICAgICAgICRzY29wZS5uYXRpb25hbCA9IHRydWU7XG4gICAgICBlbHNlICRzY29wZS5uYXRpb25hbCA9IGZhbHNlO1xuXG4gICAgICAkc2NvcGUuY2hhbmdlTWFwKGZhbHNlKTtcbiAgICAgIGlmIChhcHBseSkgJHNjb3BlLiRhcHBseSgpO1xuICAgIH07XG4gIH1cbl0pO1xuXG5teUFwcC5jb250cm9sbGVyKFwiY29tbWFuZGVDdHJsXCIsIFtcbiAgXCIkc2NvcGVcIixcbiAgXCIkcm9vdFNjb3BlXCIsXG4gIFwiY2xpZW50U2VydmljZVwiLFxuICBcImNvbW1hbmRlU2VydmljZVwiLFxuICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRjbGllbnRTZXJ2aWNlLCAkY29tbWFuZGVTZXJ2aWNlKSB7XG4gICAgJHNjb3BlLmNsaWVudCA9IHt9O1xuICAgICRzY29wZS5jb21tYW5kZSA9IHt9O1xuICAgICRzY29wZS56b25lcyA9IFtdO1xuICAgICRzY29wZS5wYXRoID0gXCJcIjtcblxuICAgICRjbGllbnRTZXJ2aWNlLmdldE1lKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlcCkge1xuICAgICAgICAkc2NvcGUuY2xpZW50ID0gcmVwLmNsaWVudDtcbiAgICAgICAgJHNjb3BlLmNvbW1hbmRlID0gcmVwLmNvbW1hbmRlO1xuICAgICAgICAkc2NvcGUuem9uZXMgPSBhbmd1bGFyLmNvcHkocmVwLmNvbW1hbmRlLnpvbmVzKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICB9XG4gICAgKTtcblxuICAgICRzY29wZS5zYXZlQ2xpZW50ID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgaWYgKCFwYXRoIHx8IHBhdGggPT09IHVuZGVmaW5lZCkgcGF0aCA9ICRzY29wZS5wYXRoO1xuICAgICAgJGNsaWVudFNlcnZpY2VcbiAgICAgICAgLm1vZGlmKCRzY29wZS5jbGllbnQuX2lkLCAkc2NvcGUuY2xpZW50KVxuICAgICAgICAudGhlbihmdW5jdGlvbihjbGllbnQpIHtcbiAgICAgICAgICBhbmd1bGFyLmNvcHkoY2xpZW50LCAkc2NvcGUuY2xpZW50KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLmdvKHBhdGgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9XG5dKTtcblxubXlBcHAuY29udHJvbGxlcihcInBhaWVtZW50Q3RybFwiLCBbXG4gIFwiJHNjb3BlXCIsXG4gIFwiJGxvY2F0aW9uXCIsXG4gIFwiJHJvb3RTY29wZVwiLFxuICBcImNsaWVudFNlcnZpY2VcIixcbiAgXCJjb21tYW5kZVNlcnZpY2VcIixcbiAgXCJwYWllbWVudFNlcnZpY2VcIixcbiAgZnVuY3Rpb24oXG4gICAgJHNjb3BlLFxuICAgICRsb2NhdGlvbixcbiAgICAkcm9vdFNjb3BlLFxuICAgICRjbGllbnRTZXJ2aWNlLFxuICAgICRjb21tYW5kZVNlcnZpY2UsXG4gICAgJHBhaWVtZW50U2VydmljZVxuICApIHtcbiAgICAkc2NvcGUuY2xpZW50ID0ge1xuICAgICAgZW50cmVwcmlzZTogXCJcIixcbiAgICAgIGFkcmVzc2U6IFwiXCIsXG4gICAgICB2aWxsZTogXCJcIixcbiAgICAgIHBheXM6IFwiXCIsXG4gICAgICBhY3Rpdml0w6k6IFwiXCIsXG4gICAgICB0ZWxlcGhvbmU6IFwiXCIsXG4gICAgICB0dmE6IFwiXCJcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNvbW1hbmRlID0ge1xuICAgICAgaW50aXR1bGU6IFwiXCIsXG4gICAgICBwb2lkOiBcIlwiLFxuICAgICAgZm9ybWF0OiBcIlwiLFxuICAgICAgY29udGVudTogXCJcIixcbiAgICAgIHNlbWFpbmU6IFwiXCIsXG4gICAgICB0b3RhbDogMFxuICAgIH07XG5cbiAgICB2YXIgaG9zdE5hbWUgPVxuICAgICAgJGxvY2F0aW9uLnByb3RvY29sKCkgK1xuICAgICAgXCI6Ly9cIiArXG4gICAgICAkbG9jYXRpb24uaG9zdCgpICtcbiAgICAgIFwiOlwiICtcbiAgICAgICRsb2NhdGlvbi5wb3J0KCkgK1xuICAgICAgXCIvXCI7XG5cbiAgICAkc2NvcGUucGFpZW1lbnQgPSB7XG4gICAgICBtb250YW50OiAwLFxuICAgICAgcGVyY2VudDogJHNjb3BlLmZyYWlzLFxuICAgICAgY2FyZFJlZ2lzdHJhdGlvbjoge1xuICAgICAgICBBY2Nlc3NLZXk6IFwiXCIsXG4gICAgICAgIENhcmRSZWdpc3RyYXRpb25VUkw6IGhvc3ROYW1lLFxuICAgICAgICBDYXJkVHlwZTogXCJcIixcbiAgICAgICAgUHJlcmVnaXN0cmF0aW9uRGF0YTogXCJcIixcbiAgICAgICAgcmV0dXJuVVJMOiBob3N0TmFtZSArIFwicmVnbGVtZW50XCJcbiAgICAgIH0sXG4gICAgICBjcnlwdG86IFwiXCIsXG4gICAgICBkYXRlOiB7IG1vaXM6IDEsIHllYXI6IDIwMTggfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZW5Db3VycyA9IGZhbHNlO1xuXG4gICAgJGNsaWVudFNlcnZpY2UuZ2V0TWUoKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgICRzY29wZS5jbGllbnQgPSByZXAuY2xpZW50O1xuICAgICAgICAkc2NvcGUuY29tbWFuZGUgPSByZXAuY29tbWFuZGU7XG4gICAgICAgIGFuZ3VsYXIuY29weShyZXAuY29tbWFuZGUuem9uZXMsICRzY29wZS56b25lcyk7XG4gICAgICAgIGFuZ3VsYXIuY29weShyZXAuY29tbWFuZGUudG90YWwsICRzY29wZS5wYWllbWVudC5tb250YW50KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICB9XG4gICAgKTtcblxuICAgICRzY29wZS5zYXZlQ2FyZCA9IGZ1bmN0aW9uKGNhcmQpIHtcbiAgICAgIHJldHVybiAkcGFpZW1lbnRTZXJ2aWNlLnNhdmVDYXJkKGNhcmQpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHJlcCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gJHNjb3BlLnNhdmVDbGllbnQgPSBmdW5jdGlvbihldmVudCl7XG4gICAgLy8gXHQkKFwiI2J0bl9wYWllbWVudFwiKS52YWwoXCIuLi4gVmFsaWRhdGlvbiBlbiBjb3VycyAuLi5cIik7XG4gICAgLy8gXHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIFx0JGNsaWVudFNlcnZpY2UubW9kaWYoJHNjb3BlLmNsaWVudC5faWQsICRzY29wZS5jbGllbnQpLnRoZW4oZnVuY3Rpb24oY2xpZW50KXtcbiAgICAvLyBcdFx0YW5ndWxhci5jb3B5KGNsaWVudCwgJHNjb3BlLmNsaWVudCk7XG4gICAgLy8gXHRcdCRwYWllbWVudFNlcnZpY2UuYWRkKCRzY29wZS5wYWllbWVudCkudGhlbihmdW5jdGlvbihjbGllbnQpe1xuICAgIC8vIFx0XHRcdCRzY29wZS5wYWllbWVudC5jYXJkUmVnaXN0cmF0aW9uLkFjY2Vzc0tleSA9IGNsaWVudC5jYXJkUmVnaXN0cmF0aW9uLkFjY2Vzc0tleTtcbiAgICAvLyBcdFx0XHQkc2NvcGUucGFpZW1lbnQuY2FyZFJlZ2lzdHJhdGlvbi5DYXJkUmVnaXN0cmF0aW9uVVJMID0gY2xpZW50LmNhcmRSZWdpc3RyYXRpb24uQ2FyZFJlZ2lzdHJhdGlvblVSTDtcbiAgICAvLyBcdFx0XHQkc2NvcGUucGFpZW1lbnQuY2FyZFJlZ2lzdHJhdGlvbi5DYXJkVHlwZSA9IGNsaWVudC5jYXJkUmVnaXN0cmF0aW9uLkNhcmRUeXBlO1xuICAgIC8vIFx0XHRcdCRzY29wZS5wYWllbWVudC5jYXJkUmVnaXN0cmF0aW9uLlByZXJlZ2lzdHJhdGlvbkRhdGEgPSBjbGllbnQuY2FyZFJlZ2lzdHJhdGlvbi5QcmVyZWdpc3RyYXRpb25EYXRhO1xuICAgIC8vIFx0XHRcdC8vICRzY29wZS4kYXBwbHkoKTtcbiAgICAvLyBcdFx0XHQkKFwiI2J0bl9wYWllbWVudFwiKS52YWwoXCIuLi4gUGFpZW1lbnQgZW4gY291cnMgLi4uXCIpO1xuICAgIC8vIFx0XHRcdGV2ZW50LnRhcmdldC5zdWJtaXQoKTtcbiAgICAvLyBcdFx0fSwgZnVuY3Rpb24oZXJyKXtcbiAgICAvLyBcdFx0XHRjb25zb2xlLndhcm4oZXJyKTtcbiAgICAvLyBcdFx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgIC8vIFx0XHR9KVxuICAgIC8vIFx0fSwgZnVuY3Rpb24oZXJyKXtcbiAgICAvLyBcdFx0Y29uc29sZS53YXJuKGVycik7XG4gICAgLy8gXHRcdHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgLy8gXHR9KTtcbiAgICAvLyB9XG5cbiAgICAkc2NvcGUubW9pcyA9IF8ucmFuZ2UoMSwgMTMpLm1hcChmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgICBkLnNldE1vbnRoKG4pO1xuICAgICAgcmV0dXJuIG4gPT0gMTIgPyBcIjEyXCIgOiBuIDwgMTAgPyBcIjBcIiArIGQuZ2V0TW9udGgoKSA6IGQuZ2V0TW9udGgoKTtcbiAgICB9KTtcblxuICAgICRzY29wZS55ZWFycyA9IF8ucmFuZ2UoMTUpLm1hcChmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAgICBkLnNldFllYXIoZC5nZXRGdWxsWWVhcigpICsgbik7XG4gICAgICByZXR1cm4gZC5nZXRGdWxsWWVhcigpO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnR5cGVDYXJkID0gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHZhbCA9ICRzY29wZS5wYWllbWVudC5jYXJ0ZTtcbiAgICAgIHZhciBuZXd2YWwgPSBcIlwiO1xuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoL1xccy9nLCBcIlwiKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpICUgNCA9PSAwICYmIGkgPiAwKSBuZXd2YWwgPSBuZXd2YWwuY29uY2F0KFwiIFwiKTtcbiAgICAgICAgbmV3dmFsID0gbmV3dmFsLmNvbmNhdCh2YWxbaV0pO1xuICAgICAgfVxuICAgICAgJHNjb3BlLnBhaWVtZW50LmNhcnRlID0gbmV3dmFsO1xuICAgIH07XG4gIH1cbl0pO1xuXG5teUFwcC5jb250cm9sbGVyKFwidmFsaWRhdGlvbkN0cmxcIiwgW1xuICBcIiRzY29wZVwiLFxuICBcIiRyb290U2NvcGVcIixcbiAgXCIkdGltZW91dFwiLFxuICBcImNvbW1hbmRlU2VydmljZVwiLFxuICBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCAkY29tbWFuZGVTZXJ2aWNlKSB7XG4gICAgdmFyIG5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRjb21tYW5kZVNlcnZpY2UuY2xlYXIoKTtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkcm9vdFNjb3BlLmdvKFwiL1wiKTtcbiAgICAgIH0sIDI1MDApO1xuICAgIH07XG5cbiAgICAkY29tbWFuZGVTZXJ2aWNlLmVtYWlsKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlcCkge1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICB0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgICAgICBuZXh0KCk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXSk7XG5cbm15QXBwLmNvbnRyb2xsZXIoXCJyZWdsZW1lbnRDdHJsXCIsIFtcbiAgXCIkc2NvcGVcIixcbiAgXCIkbG9jYXRpb25cIixcbiAgXCIkdGltZW91dFwiLFxuICBcImNvbW1hbmRlU2VydmljZVwiLFxuICBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgJHRpbWVvdXQsICRjb21tYW5kZVNlcnZpY2UpIHtcbiAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGNvbW1hbmRlU2VydmljZS5jbGVhcigpO1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRyb290U2NvcGUuZ28oXCIvXCIpO1xuICAgICAgfSwgMjUwMCk7XG4gICAgfTtcblxuICAgICRjb21tYW5kZVNlcnZpY2UuZW1haWwoKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgIHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5dKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5teUFwcC5kaXJlY3RpdmUoXCJkM01hcFwiLCBbXG4gIFwiJHRpbWVvdXRcIixcbiAgXCIkd2luZG93XCIsXG4gIGZ1bmN0aW9uKCR0aW1lb3V0LCAkd2luZG93KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICAgIHNjb3BlOiB7XG4gICAgICAgIG1hcDogXCJAXCIsXG4gICAgICAgIGNpdGllczogXCJAXCIsXG4gICAgICAgIHJlZ2lvbnM6IFwiPVwiLFxuICAgICAgICB6b25lc0RhdGE6IFwiPVwiLFxuICAgICAgICB3aWR0aDogXCJAXCIsXG4gICAgICAgIGhlaWdodDogXCJAXCIsXG4gICAgICAgIGN0cmxBam91dDogXCI9XCIsXG4gICAgICAgIGN0cmxSZW1vdmU6IFwiPVwiLFxuICAgICAgICBjdHJsQWpvdXRNdWx0aTogXCI9XCIsXG4gICAgICAgIGN0cmxSZW1vdmVNdWx0aTogXCI9XCIsXG4gICAgICAgIGN0cmxSZWdpb25BY3RpZjogXCI9XCJcbiAgICAgIH0sXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycykge1xuICAgICAgICAvLyBWYWxldXJzIHBhciBkw6lmYXVsdFxuXG4gICAgICAgIHZhciBtYXJnaW4gPSB7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9LFxuICAgICAgICAgIHdpZHRoID0gZDMuc2VsZWN0KGVsZVswXSkubm9kZSgpLm9mZnNldFdpZHRoLFxuICAgICAgICAgIHdpZHRoID0gc2NvcGUud2lkdGggPT09IHVuZGVmaW5lZCA/IHdpZHRoIDogc2NvcGUud2lkdGgsXG4gICAgICAgICAgd2lkdGggPSB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0LFxuICAgICAgICAgIGhlaWdodCA9IHNjb3BlLmhlaWdodCA9PT0gdW5kZWZpbmVkID8gMjAwMCA6IHNjb3BlLmhlaWdodCxcbiAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSxcbiAgICAgICAgICBtYXAgPSBzY29wZS5tYXAgPT09IHVuZGVmaW5lZCA/IFwiTHV4ZW1ib3VyZy5zdmdcIiA6IHNjb3BlLm1hcCxcbiAgICAgICAgICBjaXRpZXMgPSBzY29wZS5jaXRpZXMgPT09IHVuZGVmaW5lZCA/IFwiQ29tbXVuZS50c3ZcIiA6IHNjb3BlLmNpdGllcyxcbiAgICAgICAgICByZWdpb25zID0gc2NvcGUucmVnaW9ucyA9PT0gdW5kZWZpbmVkID8gbmV3IEFycmF5KCkgOiBzY29wZS5yZWdpb25zO1xuXG4gICAgICAgIHNjb3BlLmRhdGEgPSBudWxsO1xuICAgICAgICBzY29wZS56b25lc0RhdGEgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgc2NvcGUucGF0aHMgPSBuZXcgQXJyYXkoKTtcblxuICAgICAgICAvLyB2YXIgY29sb3JDZW50cmUgPSBcIiM1ZDI0OTFcIixcbiAgICAgICAgLy8gICBjb2xvclN1ZCA9IFwiI2MwMWEyY1wiLFxuICAgICAgICAvLyAgIGNvbG9yRXN0ID0gXCIjMzg3MWMyXCIsXG4gICAgICAgIC8vICAgY29sb3JOb3JkID0gXCIjZmJiZDEzXCI7XG4gICAgICAgIC8vIHZhciBjb2xvckNlbnRyZSA9IFwiIzVkMjQ5MVwiLFxuICAgICAgICAvLyAgIGNvbG9yU3VkID0gXCIjYzAxYTJjXCIsXG4gICAgICAgIC8vICAgY29sb3JFc3QgPSBcIiMzODcxYzJcIixcbiAgICAgICAgLy8gICBjb2xvck5vcmQgPSBcIiNmYmJkMTNcIjtcblxuICAgICAgICBsZXQgY29sb3JPdWVzdCA9IFwiI0YwMDAwMFwiO1xuICAgICAgICBsZXQgY29sb3JOb3JkID0gXCIjMEYzRDAwXCI7XG4gICAgICAgIGxldCBjb2xvckVzdCA9IFwiIzAwRjAyNFwiO1xuICAgICAgICBsZXQgY29sb3JTdWRFc3QgPSBcIiMwRDBGMUZcIjtcbiAgICAgICAgbGV0IGNvbG9yU3VkID0gXCIjMDAwMEYwXCI7XG4gICAgICAgIGxldCBjb2xvclN1ZE91ZXN0ID0gXCIjMEZEMEZGXCI7XG5cbiAgICAgICAgd2lkdGggPSBkMy5zZWxlY3QoZWxlWzBdKS5ub2RlKCkub2Zmc2V0V2lkdGg7XG5cbiAgICAgICAgdmFyIHN2ZyA9IGQzXG4gICAgICAgICAgLnNlbGVjdChlbGVbMF0pXG4gICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuICAgICAgICB2YXIgZm9ybWF0TnVtYmVyID0gZDMuZm9ybWF0KFwiLjFmXCIpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpZHRoID0gZDMuc2VsZWN0KGVsZVswXSkubm9kZSgpLm9mZnNldFdpZHRoO1xuICAgICAgICAgIHN2Zy5hdHRyKFwid2lkdGhcIiwgd2lkdGgpO1xuICAgICAgICAgIGQzLnNlbGVjdChcImdcIikucmVtb3ZlKCk7XG4gICAgICAgICAgc2NvcGUucmVuZGVyKHNjb3BlLm1hcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICBcIm1hcFwiLFxuICAgICAgICAgIGZ1bmN0aW9uKG5ld0RhdGEsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5yZW5kZXIobmV3RGF0YSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKFxuICAgICAgICAgIFwiY2l0aWVzXCIsXG4gICAgICAgICAgZnVuY3Rpb24obmV3RGF0YSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRGaWxlKG5ld0RhdGEpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICBcInJlZ2lvbnNcIixcbiAgICAgICAgICBmdW5jdGlvbihuZXdEYXRhLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIHpvbmVSZW1vdmVzID0gbmV3IEFycmF5KCk7XG4gICAgICAgICAgICB2YXIgem9uZUFqb3V0cyA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgc2NvcGUucmVnaW9ucyA9IGFuZ3VsYXIuY29weShuZXdEYXRhKTtcbiAgICAgICAgICAgIHZhciB6b25lc0RlamEgPSBhbmd1bGFyLmNvcHkoc2NvcGUuem9uZXNEYXRhKTtcblxuICAgICAgICAgICAgaWYgKG9sZFZhbHVlID09PSB1bmRlZmluZWQpIG9sZFZhbHVlID0gbmV3IEFycmF5KCk7XG5cbiAgICAgICAgICAgIHNjb3BlLnBhdGhzLmZvckVhY2goZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICB2YXIgaWQgPSBwYXRoLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgdmFyIGRhdGEgPSBzY29wZS5kYXRhW2lkXTtcblxuICAgICAgICAgICAgICB2YXIgaWR4Wm9uZSA9IHpvbmVzRGVqYVxuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oeikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHpbXCJWaWxsZVwiXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5pbmRleE9mKGRhdGFbXCJWaWxsZVwiXSk7XG5cbiAgICAgICAgICAgICAgaWYgKHNjb3BlLnJlZ2lvbnMuaW5kZXhPZihcIm5hdGlvbmFsXCIpICE9PSAtMSAmJiBpZHhab25lID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHpvbmVzRGVqYS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgIHpvbmVBam91dHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBzY29wZS5yZWdpb25zLmluZGV4T2YoZGF0YVtcInJlZ2lvblwiXSkgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgaWR4Wm9uZSA9PT0gLTFcbiAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgem9uZXNEZWphLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgem9uZUFqb3V0cy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIG9sZFZhbHVlLmluZGV4T2YoZGF0YVtcInJlZ2lvblwiXSkgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgc2NvcGUucmVnaW9ucy5pbmRleE9mKGRhdGFbXCJyZWdpb25cIl0pID09PSAtMSAmJlxuICAgICAgICAgICAgICAgIGlkeFpvbmUgIT09IC0xXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHpvbmVzRGVqYS5zcGxpY2UoaWR4Wm9uZSwgMSk7XG4gICAgICAgICAgICAgICAgem9uZVJlbW92ZXMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLnBhdGhzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICB2YXIgaWQgPSBwLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgdmFyIGRhdGEgPSBzY29wZS5kYXRhW2lkXTtcblxuICAgICAgICAgICAgICBpZiAoem9uZXNEZWphLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBab25lcyBzw6lsZWN0aW9ubmVyXG5cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICB6b25lc0RlamFcbiAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbih6KSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpbXCJWaWxsZVwiXTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmluZGV4T2YoZGF0YVtcIlZpbGxlXCJdKSAhPT0gLTFcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIHAuYXR0cihcImNsYXNzXCIsIFwicGF0aEFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgIC8vIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgLy8gICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJFc3QgLyBvc3RlblwiKVxuICAgICAgICAgICAgICAgICAgLy8gICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJTdWQgLyBzdWRlblwiKVxuICAgICAgICAgICAgICAgICAgLy8gICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICAvLyAgIHAuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcIm91ZXN0XCIpIHAuYXR0cihcImZpbGxcIiwgY29sb3JPdWVzdCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJub3JkXCIpIHAuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcImVzdFwiKSBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcInN1ZC1lc3RcIikgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZEVzdCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJzdWRcIikgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJzdWQtb3Vlc3RcIilcbiAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZE91ZXN0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhSZWdpb25cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gc2NvcGUuem9uZXNEYXRhID0gYW5ndWxhci5jb3B5KHpvbmVzRGVqYSk7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZWdpb25XYXRjaCcpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coem9uZUFqb3V0cy5sZW5ndGgpXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh6b25lUmVtb3Zlcy5sZW5ndGgpXG5cbiAgICAgICAgICAgIC8vIGFqb3V0cyBvdSBzdXBwcmVzc2lvbiBkYW5zIGRvbm7DqWVzXG5cbiAgICAgICAgICAgIGlmICh6b25lQWpvdXRzLmxlbmd0aCA+IDApIHNjb3BlLmN0cmxBam91dE11bHRpKHpvbmVBam91dHMpO1xuICAgICAgICAgICAgaWYgKHpvbmVSZW1vdmVzLmxlbmd0aCA+IDApIHNjb3BlLmN0cmxSZW1vdmVNdWx0aSh6b25lUmVtb3Zlcyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKFxuICAgICAgICAgIFwiem9uZXNEYXRhXCIsXG4gICAgICAgICAgZnVuY3Rpb24obmV3RGF0YSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG9sZFZhbHVlKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG5ld0RhdGEpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc2NvcGUuem9uZXNEYXRhRGF0YSk7XG5cbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgem9uZXNEZWphID0gYW5ndWxhci5jb3B5KG5ld0RhdGEpO1xuXG4gICAgICAgICAgICAgIC8vIHNjb3BlLnBhdGhzLmZvckVhY2goZnVuY3Rpb24ocGF0aCl7XG5cbiAgICAgICAgICAgICAgLy8gXHR2YXIgaWQgPSBwYXRoLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgLy8gXHR2YXIgZGF0YSA9IHNjb3BlLmRhdGFbaWRdO1xuXG4gICAgICAgICAgICAgIC8vIFx0aWYoc2NvcGUucmVnaW9ucy5pbmRleE9mKCduYXRpb25hbCcpICE9PSAtMSAmJiBzY29wZS56b25lc0RhdGEuaW5kZXhPZihkYXRhKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAvLyBcdFx0Ly8gcGFzIGRhbnMgbGVzIHpvbmVzIGV0IG5hdGlvbmFsXG4gICAgICAgICAgICAgIC8vIFx0XHRzY29wZS56b25lc0RhdGEucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgLy8gXHR9ZWxzZSBpZihzY29wZS5yZWdpb25zLmluZGV4T2YoZGF0YVsncmVnaW9uJ10pICE9PSAtMSAmJiBzY29wZS56b25lc0RhdGEuaW5kZXhPZihkYXRhKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAvLyBcdFx0Ly8gcGFzIGRhbnMgbGVzIHpvbmVzIGV0IGRhbnMgbGEgcmVnaW9uXG4gICAgICAgICAgICAgIC8vIFx0XHRzY29wZS56b25lc0RhdGEucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgLy8gXHR9ZWxzZSBpZihvbGRWYWx1ZS5pbmRleE9mKGRhdGFbJ3JlZ2lvbiddKSAhPT0gLTEgJiYgc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSkgIT09IC0xKXtcbiAgICAgICAgICAgICAgLy8gXHRcdHZhciBpZHggPSBzY29wZS56b25lc0RhdGEuaW5kZXhPZihkYXRhKTtcbiAgICAgICAgICAgICAgLy8gXHRcdGlmKGlkeCAhPT0gLTEpe1xuICAgICAgICAgICAgICAvLyBcdFx0XHRzY29wZS56b25lc0RhdGEuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICAgIC8vIFx0XHR9XG4gICAgICAgICAgICAgIC8vIFx0fTtcbiAgICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgICAgLy8gQ291bGV1ciBkZXMgem9uZXNcbiAgICAgICAgICAgICAgc2NvcGUucGF0aHMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0gcC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBzY29wZS5kYXRhW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoem9uZXNEZWphLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgem9uZXNEZWphXG4gICAgICAgICAgICAgICAgICAgICAgLm1hcChmdW5jdGlvbih6KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geltcIlZpbGxlXCJdO1xuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgLmluZGV4T2YoZGF0YVtcIlZpbGxlXCJdKSAhPT0gLTFcbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBwLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhBY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgICAvLyAgIHAuYXR0cihcImZpbGxcIiwgY29sb3JDZW50cmUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAgICAgLy8gICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgIC8vICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJvdWVzdFwiKSBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yT3Vlc3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJub3JkXCIpIHAuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT09IFwiZXN0XCIpIHAuYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJzdWQtZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZEVzdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcInN1ZFwiKSBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT09IFwic3VkLW91ZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZE91ZXN0KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoUmVnaW9uXCIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIikuYXR0cihcImNsYXNzXCIsIFwicGF0aFJlZ2lvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIFJlY2hlcmNoZSBkZSByw6lnaW9ucyBFbnRpZXJlbWVudCBBY3RpdmVzXG5cbiAgICAgICAgICAgICAgdmFyIHJlZ2lvbnMgPSBbXG4gICAgICAgICAgICAgICAgXCJvdWVzdFwiLFxuICAgICAgICAgICAgICAgIFwibm9yZFwiLFxuICAgICAgICAgICAgICAgIFwiZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJzdWQtZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJzdWRcIixcbiAgICAgICAgICAgICAgICBcInN1ZC1vdWVzdFwiXG4gICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgcmVnaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJlZykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVnXCIpO1xuICAgICAgICAgICAgICAgIHZhciBuYiA9IHNjb3BlLnBhdGhzLmZpbHRlcihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgaWQgPSBwYXRoLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVtcInJlZ2lvblwiXSA9PSByZWc7XG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5iQWN0aWYgPSB6b25lc0RlamEuZmlsdGVyKGZ1bmN0aW9uKHpvbmUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lW1wicmVnaW9uXCJdID09IHJlZztcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZWcpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKG5iKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuYkFjdGlmKTtcblxuICAgICAgICAgICAgICAgIGlmIChuYiA9PSBuYkFjdGlmICYmIG5iID4gMCAmJiBuYkFjdGlmID4gMClcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmN0cmxSZWdpb25BY3RpZihyZWcpO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICBzY29wZS56b25lc0RhdGEgPSBhbmd1bGFyLmNvcHkoem9uZXNEZWphKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG5cbiAgICAgICAgc2NvcGUucmVuZGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgICAgICAgaWYgKG1hcCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgICAgICB2YXIgZyA9IHN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcFwiKTtcbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGQzLnhtbChtYXApXG4gICAgICAgICAgICAgIC5taW1lVHlwZShcImltYWdlL3N2Zyt4bWxcIilcbiAgICAgICAgICAgICAgLmdldChmdW5jdGlvbihlcnJvciwgZG9jKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSBjb25zb2xlLndhcm4oZXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGVsdHMgPSBBcnJheS5mcm9tKGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhdGhcIikpO1xuICAgICAgICAgICAgICAgIGVsdHMgPSBlbHRzLmZpbHRlcihmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcC5nZXRBdHRyaWJ1dGUoXCJpZFwiKS5zdWJzdHIoMCwgNCkgIT0gXCJwYXRoXCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGhDb29yZHMgPSBuZXcgQXJyYXkoKTtcblxuICAgICAgICAgICAgICAgIC8vIENyw6lhdGlvbiBkZXMgZWxlbWVudHMgLyBQYXRoc1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgdmFyIGQgPSBlbHRzW2ldLmdldEF0dHJpYnV0ZShcImRcIiksXG4gICAgICAgICAgICAgICAgICAgIGlkID0gZWx0c1tpXS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICAgIHZhciBwYXRoID0gZ1xuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgZClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0b3BcIiwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBpZClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhSZWdpb25cIik7XG4gICAgICAgICAgICAgICAgICBpZiAoIXNjb3BlLmRhdGFbaWRdKSBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgIHZhciByZWdpb24gPSBzY29wZS5kYXRhW2lkXTtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLnBhdGhzLnB1c2gocGF0aCk7XG4gICAgICAgICAgICAgICAgICAvLyBjaG9peCBkZXMgem9uZXNcblxuICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLnJlZ2lvbnMubGVuZ3RoID4gMCAmJiByZWdpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5wYXRocy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBwYXRoLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHNjb3BlLmRhdGFbaWRdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUucmVnaW9ucy5pbmRleE9mKFwibmF0aW9uYWxcIikgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS56b25lc0RhdGEuaW5kZXhPZihkYXRhKSA9PT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnpvbmVzRGF0YS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5yZWdpb25zLmluZGV4T2YoZGF0YVtcInJlZ2lvblwiXSkgIT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS56b25lc0RhdGEuaW5kZXhPZihkYXRhKSA9PT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnpvbmVzRGF0YS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIFZhbGlkZSBsYSBzw6lsZWN0aW9uIC8gem9uZXNcblxuICAgICAgICAgICAgICAgICAgLy8gaWYoc2NvcGUuem9uZXNEYXRhLmxlbmd0aCA+IDAgJiYgcmVnaW9uICE9PSB1bmRlZmluZWQpe1xuXG4gICAgICAgICAgICAgICAgICAvLyBcdGlmKHNjb3BlLnpvbmVzRGF0YS5pbmRleE9mKHJlZ2lvbikgIT09IC0xKXtcbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRwYXRoLmF0dHIoXCJjbGFzc1wiLFwicGF0aEFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgLy8gXHRcdGlmKHJlZ2lvblsncmVnaW9uJ109PVwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgLy8gXHRcdFx0cGF0aC5hdHRyKFwiZmlsbFwiLCBjb2xvckNlbnRyZSk7XG4gICAgICAgICAgICAgICAgICAvLyBcdFx0ZWxzZSBpZihyZWdpb25bJ3JlZ2lvbiddPT1cIkVzdCAvIG9zdGVuXCIpXG4gICAgICAgICAgICAgICAgICAvLyBcdFx0XHRwYXRoLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRlbHNlIGlmKHJlZ2lvblsncmVnaW9uJ109PVwiU3VkIC8gc3VkZW5cIilcbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRcdHBhdGguYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgICAgLy8gXHRcdGVsc2UgaWYocmVnaW9uWydyZWdpb24nXT09XCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICAvLyBcdFx0XHRwYXRoLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG4gICAgICAgICAgICAgICAgICAvLyBcdH1cbiAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgIHZhciBib3ggPSBwYXRoLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgICAgICAgICAgICAgICBwYXRoQ29vcmRzLnB1c2goYm94KTtcbiAgICAgICAgICAgICAgICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGJveFtcInhcIl0gKyBib3hbXCJ3aWR0aFwiXSAvIDIsXG4gICAgICAgICAgICAgICAgICAgIHk6IGJveFtcInlcIl0gKyBib3hbXCJoZWlnaHRcIl0gLyAyXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgcGF0aFxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgY2VudGVyW1wieFwiXSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCBjZW50ZXJbXCJ5XCJdKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgXCI0cHhcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgICAgICAgICAgLmNsYXNzZWQoXCJ0b3BcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVjaGVyY2hlIGRlIHLDqWdpb25zIEVudGllcmVtZW50IEFjdGl2ZXNcblxuICAgICAgICAgICAgICAgIC8vIHZhciByZWdpb25zID0gbmV3IEFycmF5KFxuICAgICAgICAgICAgICAgIC8vICAgXCJDZW50cmUgLyB6ZW50cnVtXCIsXG4gICAgICAgICAgICAgICAgLy8gICBcIkVzdCAvIG9zdGVuXCIsXG4gICAgICAgICAgICAgICAgLy8gICBcIlN1ZCAvIHN1ZGVuXCIsXG4gICAgICAgICAgICAgICAgLy8gICBcIk5vcmQgLyBub3JkZW5cIlxuICAgICAgICAgICAgICAgIC8vICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVnaW9ucyA9IFtcbiAgICAgICAgICAgICAgICAgIFwib3Vlc3RcIixcbiAgICAgICAgICAgICAgICAgIFwibm9yZFwiLFxuICAgICAgICAgICAgICAgICAgXCJlc3RcIixcbiAgICAgICAgICAgICAgICAgIFwic3VkLWVzdFwiLFxuICAgICAgICAgICAgICAgICAgXCJzdWRcIixcbiAgICAgICAgICAgICAgICAgIFwic3VkLW91ZXN0XCJcbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgcmVnaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJlZykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5iID0gc2NvcGUucGF0aHMuZmlsdGVyKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YSkgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW1wicmVnaW9uXCJdID09IHJlZztcbiAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIHZhciBuYkFjdGlmID0gc2NvcGUuem9uZXNEYXRhLmZpbHRlcihmdW5jdGlvbih6b25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lW1wicmVnaW9uXCJdID09IHJlZztcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgaWYgKG5iID09IG5iQWN0aWYpIHNjb3BlLmN0cmxSZWdpb25BY3RpZihyZWcpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gVHJhbnNsYXRpb24gZHUgU1ZHIGF1IG1pbiBkZXMgYXhlcyAtMC41ICVcblxuICAgICAgICAgICAgICAgIHZhciBtaW5ZID0gZDMubWluKFxuICAgICAgICAgICAgICAgICAgcGF0aENvb3Jkcy5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcFtcInlcIl07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IGQzLm1pbihcbiAgICAgICAgICAgICAgICAgIHBhdGhDb29yZHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBbXCJ4XCJdO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZy5hdHRyKFxuICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgICAgICAgIFwidHJhbnNsYXRlKFwiICtcbiAgICAgICAgICAgICAgICAgICAgbWluWCAqIC0wLjkgK1xuICAgICAgICAgICAgICAgICAgICBcIiwtXCIgK1xuICAgICAgICAgICAgICAgICAgICBtaW5ZICogMC4xICtcbiAgICAgICAgICAgICAgICAgICAgXCIpIHNjYWxlKDAuOTUsMSlcIlxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBQb3NpdGlvbm5lbWVudCBkdSBjYWRyZSDDoCArMjAgJVxuXG4gICAgICAgICAgICAgICAgdmFyIG1heFkgPSBkMy5tYXgoXG4gICAgICAgICAgICAgICAgICBwYXRoQ29vcmRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwW1wieVwiXSArIHBbXCJoZWlnaHRcIl07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF4WCA9IGQzLm1heChcbiAgICAgICAgICAgICAgICAgIHBhdGhDb29yZHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBbXCJ4XCJdICsgcFtcIndpZHRoXCJdO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1heFggKiAwLjgpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWF4WSAvIDUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1heFggKiAwLjQpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBtYXhZICogMC4yKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJncmV5XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInJ4XCIsIFwiOFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeVwiLCBcIjhcIilcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gTGlnbmUgbGlhbnQgbGUgY2FkcmUgJiBsZSBwYXRoXG5cbiAgICAgICAgICAgICAgICB2YXIgbGluZSA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIGNlbnRlcltcInhcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIGNlbnRlcltcInlcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIHJlY3QuYXR0cihcInhcIikpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcbiAgICAgICAgICAgICAgICAgICAgXCJ5MlwiLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZWN0LmF0dHIoXCJ5XCIpKSArIHBhcnNlSW50KHJlY3QuYXR0cihcImhlaWdodFwiKSAvIDIpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJncmV5XCIpO1xuICAgICAgICAgICAgICAgIC8vIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwic2NhbGUoXCIgKyAoMSAtIGQgLyAyNSkgKiAyMCArIFwiKVwiOyB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYW5ndWxhci5jb3B5KHJlZ2lvbik7XG4gICAgICAgICAgICAgICAgLy8gR2VzdGlvbiBkdSB0ZXh0ZSBkYW5zIGxlIGNhZHJlXG4gICAgICAgICAgICAgICAgdmFyIHggPSBwYXJzZUludChyZWN0LmF0dHIoXCJ4XCIpKSxcbiAgICAgICAgICAgICAgICAgIHkgPSBwYXJzZUludChyZWN0LmF0dHIoXCJ5XCIpKSxcbiAgICAgICAgICAgICAgICAgIHcgPSBwYXJzZUludChyZWN0LmF0dHIoXCJ3aWR0aFwiKSksXG4gICAgICAgICAgICAgICAgICBoID0gcGFyc2VJbnQocmVjdC5hdHRyKFwiaGVpZ2h0XCIpKTtcbiAgICAgICAgICAgICAgICB2YXIgdmlsbGUgPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHggKyAxNSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgMzUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJWaWxsZVwiXSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAgICAgICAgICAgICAgIHZhciByZWdpb24gPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHggKyAxNSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgNjUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjIwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJyZWdpb25cIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgYnJ1dCA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgeCArIDE1KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyAxMDUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJicnV0XCJdKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiYmxhY2tcIik7XG4gICAgICAgICAgICAgICAgdmFyIG5ldCA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgeCArIDE1KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyAxMzUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJuZXRcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgIC8vICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAvLyAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgLy8gICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgLy8gICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcblxuICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcIm91ZXN0XCIpIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvck91ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PT0gXCJub3JkXCIpIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcImVzdFwiKSByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09PSBcInN1ZC1lc3RcIilcbiAgICAgICAgICAgICAgICAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZEVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT09IFwic3VkXCIpIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT09IFwic3VkLW91ZXN0XCIpXG4gICAgICAgICAgICAgICAgICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JTdWRPdWVzdCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBc3NvY2lhdGlvbiBkZXMgZGF0YXNcblxuICAgICAgICAgICAgICAgIC8vIEdlc3Rpb24gZGUgbGEgc291cmlzXG5cbiAgICAgICAgICAgICAgICBnLnNlbGVjdEFsbChcInBhdGhcIilcbiAgICAgICAgICAgICAgICAgIC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBcIm9yYW5nZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNpcmNsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3QoXCJjaXJjbGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIGNpcmNsZS5hdHRyKFwiY3hcIikpXG4gICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCBjaXJjbGUuYXR0cihcImN5XCIpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR4dCA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHNjb3BlLmRhdGEpLmluZGV4T2YoaWQpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHZpbGxlTmFtZSA9IGRbXCJWaWxsZVwiXS5yZXBsYWNlKFwiX1wiLCBcIiBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgdmlsbGVOYW1lID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpbGxlTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgdmlsbGVOYW1lLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHZpbGxlTmFtZSA9IHJlZ2lvbi50ZXh0KGRbXCJyZWdpb25cIl0pO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHZpbGxlTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgdmlsbGVOYW1lLnN1YnN0cigxKTtcblxuICAgICAgICAgICAgICAgICAgICAgIHZpbGxlLnRleHQodmlsbGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICBicnV0LnRleHQoXCJCcnV0IDogXCIgKyBkW1wiYnJ1dFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgbmV0LnRleHQoXCJOZXQgOiBcIiArIGRbXCJuZXRcIl0pO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChkW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgICAgIC8vICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChkW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcIm91ZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JPdWVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT09IFwibm9yZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT09IFwiZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcInN1ZC1lc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZEVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT09IFwic3VkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcInN1ZC1vdWVzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkT3Vlc3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ291bGV1ciBkdSB0ZXh0ZSBSw6lnaW9uXG5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvckNlbnRyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIkVzdCAvIG9zdGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRbXCJyZWdpb25cIl0gPT0gXCJTdWQgLyBzdWRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChkW1wicmVnaW9uXCJdID09IFwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtcInJlZ2lvblwiXSA9PT0gXCJvdWVzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yT3Vlc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcIm5vcmRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcImVzdFwiKSByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcInN1ZC1lc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZEVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT09IFwic3VkXCIpIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT09IFwic3VkLW91ZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkT3Vlc3QpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHZpbGxlLnRleHQoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbi50ZXh0KFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgIGJydXQudGV4dChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICBuZXQudGV4dChcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5vbihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiY2xhc3NcIikgIT0gXCJwYXRoQWN0aXZlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIik7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBkMy5zZWxlY3QodGhpcykuYXR0cihcImlkXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHNjb3BlLmRhdGFbaWRdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkMy5zZWxlY3QodGhpcykuYXR0cihcImNsYXNzXCIpID09IFwicGF0aEFjdGl2ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY3RybFJlbW92ZShkYXRhLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoUmVnaW9uXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jdHJsQWpvdXQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhBY3RpdmVcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvckNlbnRyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIkVzdCAvIG9zdGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJTdWQgLyBzdWRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIC8vICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIC8vICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtcInJlZ2lvblwiXSA9PT0gXCJvdWVzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yT3Vlc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcIm5vcmRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcImVzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtcInJlZ2lvblwiXSA9PT0gXCJzdWQtZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JTdWRFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChkW1wicmVnaW9uXCJdID09PSBcInN1ZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtcInJlZ2lvblwiXSA9PT0gXCJzdWQtb3Vlc3RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZE91ZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLmxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgIGQzLmNzdihmaWxlLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRhID0ge307XG4gICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRhW2RbXCJWaWxsZVwiXV0gPSBkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdjbGllbnQuc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJjbGllbnRTZXJ2aWNlXCIsIFsnJHEnLCAnJGh0dHAnLCBmdW5jdGlvbigkcSwgJGh0dHApe1xuXG5cdFx0cmV0dXJue1xuXHRcdFx0Z2V0OmZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL2NsaWVudC9nZXRcIiwge2lkOmlkfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblxuXHRcdFx0Z2V0QWxsOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9jbGllbnQvZ2V0QWxsXCIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldE1lOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2NsaWVudC9nZXRNZVwiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0YWRkOmZ1bmN0aW9uKGNvb3Jkb25uZWUpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucHV0KFwiL2FwaS9jbGllbnQvXCIsIHtjb29yZG9ubmVlOmNvb3Jkb25uZWV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0bW9kaWY6ZnVuY3Rpb24oY2xpZW50SWQsIGNvb3Jkb25uZWUpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucGF0Y2goXCIvYXBpL2NsaWVudC9cIiwge2NsaWVudElkOmNsaWVudElkLCBjb29yZG9ubmVlOmNvb3Jkb25uZWV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRjaGFuZ2VMYW5nOmZ1bmN0aW9uKGxhbmcpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucGF0Y2goXCIvYXBpL2NsaWVudC9sYW5nXCIsIHtsYW5nOmxhbmd9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRsb2FkTGFuZzpmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9jbGllbnQvbGFuZ1wiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnY29tbWFuZGUuc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJjb21tYW5kZVNlcnZpY2VcIiwgWyckcScsICckaHR0cCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCl7XG5cblx0XHRyZXR1cm57XG5cdFx0XHRnZXQ6ZnVuY3Rpb24oaWQpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvY29tbWFuZGUvZ2V0XCIsIHtpZDppZH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldE1lOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2NvbW1hbmRlL2dldE1lXCIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKGNvbW1hbmRlSWQsIGNvbW1hbmRlKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBhdGNoKFwiL2FwaS9jb21tYW5kZS9cIiwge2NvbW1hbmRlSWQ6Y29tbWFuZGVJZCwgY29tbWFuZGU6Y29tbWFuZGV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0Y2xlYXI6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvY29tbWFuZGUvY2xlYXJcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblxuXHRcdFx0ZW1haWw6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvY29tbWFuZGUvZW1haWxcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdH1dKTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwYWllbWVudC5zZXJ2aWNlcycsIFtdKVxuXHQuc2VydmljZShcInBhaWVtZW50U2VydmljZVwiLCBbJyRxJywgJyRodHRwJywgZnVuY3Rpb24oJHEsICRodHRwKXtcblxuXHRcdHJldHVybntcblx0XHRcdGdldDpmdW5jdGlvbihpZCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9wYWllbWVudFwiLCB7aWQ6aWR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0YWRkOmZ1bmN0aW9uKHBhaWVtZW50KXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnB1dChcIi9hcGkvcGFpZW1lbnRcIiwge3BhaWVtZW50OnBhaWVtZW50fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKHBhaWVtZW50KXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBhdGNoKFwiL2FwaS9wYWllbWVudFwiLCB7cGFpZW1lbnQ6cGFpZW1lbnR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0c2F2ZUNhcmQ6ZnVuY3Rpb24oY2FyZCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3BhaWVtZW50L2NhcmRcIiwge2NhcmQ6Y2FyZH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldENhcmQ6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3BhaWVtZW50L2NhcmRcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHR9XG5cdH1dKTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwcm9tb3Rpb24uc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJwcm9tb3Rpb25TZXJ2aWNlXCIsIFsnJHEnLCAnJGh0dHAnLCBmdW5jdGlvbigkcSwgJGh0dHApe1xuXG5cdFx0cmV0dXJue1xuXHRcdFx0Z2V0OmZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3Byb21vdGlvbi9nZXRcIiwge2lkOmlkfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdGdldEFsbDpmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvcHJvbW90aW9uL2dldEFsbFwiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRhZGQ6ZnVuY3Rpb24ocHJvbW90aW9uKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnB1dChcIi9hcGkvcHJvbW90aW9uL1wiLCB7cHJvbW90aW9uOnByb21vdGlvbn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKHByb21vdGlvbil7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wYXRjaChcIi9hcGkvcHJvbW90aW9uL1wiLCB7cHJvbW90aW9uOnByb21vdGlvbn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGRlbGV0ZTpmdW5jdGlvbihwcm9tb3Rpb24pe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKFwiL2FwaS9wcm9tb3Rpb24vP3Byb21JZD1cIitwcm9tb3Rpb24uX2lkKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblx0XHR9XG5cdH1dKTsiXX0=
