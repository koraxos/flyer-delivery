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
      console.log("LOOG", $scope);

      console.log("ouest", $scope["ouest"]);
      console.log("nord", $scope["nord"]);
      console.log("est", $scope["est"]);
      console.log("sud-est", $scope["sud-est"]);
      console.log("sud", $scope["sud"]);
      console.log("sud-ouest", $scope["sud-ouest"]);

      // debugger;
      if ($scope.national) {
        // $scope.nord = true;
        // $scope.est = true;
        // $scope.sud = true;
        // $scope.centre = true;
        $scope["ouest"] = true;
        $scope["nord"] = true;
        $scope["est"] = true;
        $scope["sud-est"] = true;
        $scope["sud"] = true;
        $scope["sud-ouest"] = true;
      } else if (e && e.target.id == "national") {
        // $scope.nord = false;
        // $scope.est = false;
        // $scope.sud = false;
        // $scope.centre = false;
        // $scope.centre = true;
        $scope["ouest"] = false;
        $scope["nord"] = false;
        $scope["est"] = false;
        $scope["sud-est"] = false;
        $scope["sud"] = false;
        $scope["sud-ouest"] = false;
      }
      // if ($scope.nord) $scope.regions.push("Nord / norden");
      // if ($scope.est) $scope.regions.push("Est / osten");
      // if ($scope.sud) $scope.regions.push("Sud / suden");
      // if ($scope.centre) $scope.regions.push("Centre / zentrum");
      if ($scope["ouest"]) $scope.regions.push("ouest");
      if ($scope["nord"]) $scope.regions.push("nord");
      if ($scope["est"]) $scope.regions.push("est");
      if ($scope["sud-est"]) $scope.regions.push("sud-est");
      if ($scope["sud"]) $scope.regions.push("sud");
      if ($scope["sud-ouest"]) $scope.regions.push("sud-ouest");

      return;
    };

    $scope.addRegion = function(name, apply) {
      if (apply == undefined) apply = false;

      // if (name == "Nord / norden") $scope.nord = true;
      // if (name == "Est / osten") $scope.est = true;
      // if (name == "Sud / suden") $scope.sud = true;
      // if (name == "Centre / zentrum") $scope.centre = true;
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
        var colorCentre = "#5d2491",
          colorSud = "#c01a2c",
          colorEst = "#3871c2",
          colorNord = "#fbbd13";

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
                  if (data["region"] == "Centre / zentrum")
                    p.attr("fill", colorCentre);
                  else if (data["region"] == "Est / osten")
                    p.attr("fill", colorEst);
                  else if (data["region"] == "Sud / suden")
                    p.attr("fill", colorSud);
                  else if (data["region"] == "Nord / norden")
                    p.attr("fill", colorNord);
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
                    if (data["region"] == "Centre / zentrum")
                      p.attr("fill", colorCentre);
                    else if (data["region"] == "Est / osten")
                      p.attr("fill", colorEst);
                    else if (data["region"] == "Sud / suden")
                      p.attr("fill", colorSud);
                    else if (data["region"] == "Nord / norden")
                      p.attr("fill", colorNord);
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
                "sud / est",
                "sud",
                "sud / ouest"
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

                var regions = new Array(
                  "Centre / zentrum",
                  "Est / osten",
                  "Sud / suden",
                  "Nord / norden"
                );

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

                if (data["region"] == "Centre / zentrum")
                  region.attr("fill", colorCentre);
                else if (data["region"] == "Est / osten")
                  region.attr("fill", colorEst);
                else if (data["region"] == "Sud / suden")
                  region.attr("fill", colorSud);
                else if (data["region"] == "Nord / norden")
                  region.attr("fill", colorNord);

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
                      if (d["region"] == "Centre / zentrum")
                        d3.select(this).attr("fill", colorCentre);
                      else if (d["region"] == "Est / osten")
                        d3.select(this).attr("fill", colorEst);
                      else if (d["region"] == "Sud / suden")
                        d3.select(this).attr("fill", colorSud);
                      else if (d["region"] == "Nord / norden")
                        d3.select(this).attr("fill", colorNord);

                      // Couleur du texte Région

                      if (d["region"] == "Centre / zentrum")
                        region.attr("fill", colorCentre);
                      else if (d["region"] == "Est / osten")
                        region.attr("fill", colorEst);
                      else if (d["region"] == "Sud / suden")
                        region.attr("fill", colorSud);
                      else if (d["region"] == "Nord / norden")
                        region.attr("fill", colorNord);
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

                      if (data["region"] == "Centre / zentrum")
                        d3.select(this).attr("fill", colorCentre);
                      else if (data["region"] == "Est / osten")
                        d3.select(this).attr("fill", colorEst);
                      else if (data["region"] == "Sud / suden")
                        d3.select(this).attr("fill", colorSud);
                      else if (data["region"] == "Nord / norden")
                        d3.select(this).attr("fill", colorNord);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcENvbmZpZy5qcyIsImNvbnRyb2xsZXIvYWRtaW5DdHJsLmpzIiwiY29udHJvbGxlci9jbGllbnRDdHJsLmpzIiwiZGlyZWN0aXZlcy9tYXBEaXJlY3RpdmUuanMiLCJzZXJ2aWNlcy9jbGllbnQuanMiLCJzZXJ2aWNlcy9jb21tYW5kZS5qcyIsInNlcnZpY2VzL3BhaWVtZW50LmpzIiwic2VydmljZXMvcHJvbW90aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdmpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5cblxudmFyIG15QXBwID0gYW5ndWxhci5tb2R1bGUoXCJkaXN0cmFsc2FcIiwgWyduZ0FuaW1hdGUnLCduZ1Jlc291cmNlJywgJ25nUm91dGUnLCAnbmdEaWFsb2cnLCBcblx0XHQnbmdNYXRlcmlhbCcsICduZ0Nvb2tpZXMnLCAnbmdTYW5pdGl6ZScsICduZ0NzdicsICdjbGllbnQuc2VydmljZXMnLCAnY29tbWFuZGUuc2VydmljZXMnLCAncGFpZW1lbnQuc2VydmljZXMnLCAncHJvbW90aW9uLnNlcnZpY2VzJ10pO1xuXG5cbm15QXBwLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG5cdCRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gICdYTUxIdHRwUmVxdWVzdCc7XG5cdCRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJDb250ZW50LVR5cGVcIl0gPSAgJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG5cdGlmICghJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmdldClcbiAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmdldCA9IHt9O1xuXG5cdCRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5nZXRbJ0lmLU1vZGlmaWVkLVNpbmNlJ10gPSAnMCc7XG5cdCRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5nZXRbJ0NhY2hlLUNvbnRyb2wnXSA9ICduby1jYWNoZSc7XG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmdldFsnUHJhZ21hJ10gPSAnbm8tY2FjaGUnO1xuXG5cbn1dKTtcblxuXG5cbm15QXBwLmNvbmZpZyhbJyRtZEFyaWFQcm92aWRlcicsIGZ1bmN0aW9uKCRtZEFyaWFQcm92aWRlcikge1xuICAgLy8gR2xvYmFsbHkgZGlzYWJsZXMgYWxsIEFSSUEgd2FybmluZ3MuXG4gICAkbWRBcmlhUHJvdmlkZXIuZGlzYWJsZVdhcm5pbmdzKCk7XG59XSk7XG5cblxuXG5teUFwcC5jb25maWcoZnVuY3Rpb24oJG1kSWNvblByb3ZpZGVyKSB7XG5cdCRtZEljb25Qcm92aWRlclxuXHRcdC5pY29uU2V0KFwiY2FsbFwiLCAnaWNvbnMvc2V0cy9jb21tdW5pY2F0aW9uLWljb25zLnN2ZycsIDI0KVxuXHRcdC5pY29uU2V0KFwic29jaWFsXCIsICdpY29ucy9zZXRzL3NvY2lhbC1pY29ucy5zdmcnLCAyNCk7XG59KTtcblxuXG5cblxuXG5teUFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgJHRlbXBsYXRlQ2FjaGUsICRsb2NhdGlvbiwgJGRvY3VtZW50LCBjbGllbnRTZXJ2aWNlLCBjb21tYW5kZVNlcnZpY2UpIHtcblxuXHQkcm9vdFNjb3BlLmxvYWRpbmcgPSAgZmFsc2U7XG5cdCRyb290U2NvcGUuZXZlbnQgPSAgZmFsc2U7XG5cdCRyb290U2NvcGUubmV4dCA9ICBmYWxzZTtcblx0JHJvb3RTY29wZS5kcmFwZWF1ID0gIFwic3ZnL2ZyLnN2Z1wiO1xuXHQkcm9vdFNjb3BlLmxhbmcgPSAgXCJmclwiO1xuXHQkcm9vdFNjb3BlLmxhbmdEYXRhID0gIFtdO1xuXHQkcm9vdFNjb3BlLmN1cnJlbnQgPSAgZmFsc2U7XG5cdCRyb290U2NvcGUubXNpZT1mYWxzZTtcblxuXG5cdGNsaWVudFNlcnZpY2UubG9hZExhbmcoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdCRyb290U2NvcGUubGFuZ0RhdGEgPSBkYXRhLmxhbmdzO1xuXHRcdCRyb290U2NvcGUubGFuZyA9IGRhdGEuY2xpZW50Lmxhbmc7XG5cdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0Y29uc29sZS53YXJuKGVycik7XG5cdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0fSk7XG5cblx0JHJvb3RTY29wZS4kb24oXCIkbG9jYXRpb25DaGFuZ2VTdGFydFwiLCBmdW5jdGlvbihldmVudCwgbmV4dCwgY3VycmVudCkge1xuXHRcdCRyb290U2NvcGUubG9hZGluZyA9IHRydWU7XG5cdFx0dmFyIGhvc3ROYW1lID0gJGxvY2F0aW9uLnByb3RvY29sKCkrXCI6Ly9cIiskbG9jYXRpb24uaG9zdCgpK1wiL1wiO1xuXG5cdFx0JHJvb3RTY29wZS5ldmVudCA9IGV2ZW50O1xuXHRcdCRyb290U2NvcGUubmV4dCA9IG5leHQucmVwbGFjZShob3N0TmFtZSwgXCJcIik7XG5cdFx0JHJvb3RTY29wZS5jdXJyZW50ID0gY3VycmVudC5yZXBsYWNlKGhvc3ROYW1lLCBcIlwiKTtcblxuXHRcdCRyb290U2NvcGUubmV4dCA9ICRyb290U2NvcGUubmV4dCA9PSBcIlwiID8gXCJhY2N1ZWlsXCIgOiAkcm9vdFNjb3BlLm5leHQ7XG5cdFx0JHJvb3RTY29wZS5jdXJyZW50ID0gJHJvb3RTY29wZS5jdXJyZW50ID09IFwiXCIgPyBcImFjY3VlaWxcIiA6ICRyb290U2NvcGUuY3VycmVudDtcblxuXG5cdH0pO1xuXG5cblx0JHJvb3RTY29wZS4kb24oJyR2aWV3Q29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuXHRcdCR0ZW1wbGF0ZUNhY2hlLnJlbW92ZUFsbCgpO1xuXHRcdCRyb290U2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHR9KTtcblxuXG5cdCRyb290U2NvcGUuZ28gPSBmdW5jdGlvbiAocGF0aCkge1xuXHRcdCRsb2NhdGlvbi5wYXRoKHBhdGgpO1xuXHR9O1xuXG5cblx0dmFyIG9yaWdpbmF0b3JFdjtcblx0JHJvb3RTY29wZS5vcGVuTWVudSA9IGZ1bmN0aW9uKCRtZE1lbnUsIGV2KSB7XG4gICAgICBvcmlnaW5hdG9yRXYgPSBldjtcbiAgICAgICRtZE1lbnUub3Blbihldik7XG4gICAgfTtcblxuXG5cbiAgICAkcm9vdFNjb3BlLmNoYW5nZUxhbmcgPSBmdW5jdGlvbihldiwgbGFuZyl7XG5cbiAgICBcdCRyb290U2NvcGUubGFuZyA9IGxhbmc7XG5cbiAgICBcdGNsaWVudFNlcnZpY2UuY2hhbmdlTGFuZyhsYW5nKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgIFx0XHQkcm9vdFNjb3BlLmxhbmdEYXRhID0gZGF0YS5sYW5ncztcbiAgICBcdFx0JHJvb3RTY29wZS5sYW5nID0gZGF0YS5jbGllbnQubGFuZztcbiAgICBcdH0sIGZ1bmN0aW9uKGVycil7XG4gICAgXHRcdGNvbnNvbGUud2FybihlcnIpO1xuICAgIFx0XHR0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgIFx0fSlcbiAgICB9XG5cblxuICAgIC8vIERldGVjdGlvbiBJRVxuICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgY29uc29sZS5sb2codWEpO1xuICAgIHZhciBpc19pZSA9IHVhLmluZGV4T2YoXCJNU0lFIFwiKSA+IC0xIHx8IHVhLmluZGV4T2YoXCJUcmlkZW50L1wiKSA+IC0xO1xuICAgIGlmKGlzX2llKVxuICAgIFx0JHJvb3RTY29wZS5tc2llPXRydWU7XG4gICAgXG5cbn0pO1xuXG5cblxuXG5teUFwcC5jb25maWcoZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdCRyb3V0ZVByb3ZpZGVyXG5cdFx0LndoZW4oXCIvYWNjdWVpbFwiLCB7XG5cdFx0XHR0ZW1wbGF0ZVVybDpcIi9hY2N1ZWlsXCIsXG5cdFx0XHRjb250cm9sbGVyOlwiYWNjdWVpbEN0cmxcIixcblx0XHRcdGNhY2hlOiB0cnVlXG5cdFx0fSlcblx0XHQud2hlbihcIi9jb21tYW5kZVwiLCB7XG5cdFx0XHR0ZW1wbGF0ZVVybDpcIi9jb21tYW5kZVwiLFxuXHRcdFx0Y29udHJvbGxlcjpcImNvbW1hbmRlQ3RybFwiLFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9KVxuXHRcdC53aGVuKFwiL3BhaWVtZW50XCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL3BhaWVtZW50XCIsXG5cdFx0XHRjb250cm9sbGVyOlwicGFpZW1lbnRDdHJsXCIsXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0pXG5cdFx0LndoZW4oXCIvcmVnbGVtZW50XCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL3JlZ2xlbWVudFwiLFxuXHRcdFx0Y29udHJvbGxlcjpcInJlZ2xlbWVudEN0cmxcIixcblx0XHRcdGNhY2hlOiB0cnVlXG5cdFx0fSlcblx0XHQud2hlbihcIi92YWxpZGF0aW9uXCIsIHtcblx0XHRcdHRlbXBsYXRlVXJsOlwiL3ZhbGlkYXRpb25cIixcblx0XHRcdGNvbnRyb2xsZXI6XCJ2YWxpZGF0aW9uQ3RybFwiLFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9KVxuXHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0cmVkaXJlY3RUbzogXCIvYWNjdWVpbFwiXG5cdFx0fSk7XG5cblx0JHJvdXRlUHJvdmlkZXJcblx0XHQud2hlbihcIi9hZG1pblwiLCB7XG5cdFx0XHR0ZW1wbGF0ZVVybDpcIi9hZG1pblwiLFxuXHRcdFx0Y29udHJvbGxlcjpcImFkbWluQ3RybFwiLFxuXHRcdFx0Y2FjaGU6IHRydWVcblx0XHR9KVxuXG5cdFx0LndoZW4oXCIvYWRtaW4vaW5kZXhcIiwge1xuXHRcdFx0dGVtcGxhdGVVcmw6XCIvYWRtaW4vaW5kZXhcIixcblx0XHRcdGNvbnRyb2xsZXI6XCJhZG1pbkFjY3VlaWxDdHJsXCIsXG5cdFx0XHRjYWNoZTogdHJ1ZVxuXHRcdH0pO1xuXG5cblx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHQuaHRtbDVNb2RlKHRydWUpXG5cdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5teUFwcC5jb250cm9sbGVyKFwiYWRtaW5BY2N1ZWlsQ3RybFwiLCBbJyRzY29wZScsICckcm9vdFNjb3BlJywnJHRpbWVvdXQnLCAnY2xpZW50U2VydmljZScsICdjb21tYW5kZVNlcnZpY2UnLCAncHJvbW90aW9uU2VydmljZScsIFxuXHRmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCAkY2xpZW50U2VydmljZSwgJGNvbW1hbmRlU2VydmljZSwgJHByb21vdGlvblNlcnZpY2Upe1xuXHRcdFxuXHRcdCRzY29wZS5wcm9tb3Rpb25zID0gW107XG5cdFx0JHNjb3BlLmNsaWVudHMgPSBbXTtcblxuXHRcdCRzY29wZS5wcm9tb3Rpb24gPSB7XG5cdFx0XHRlbnRyZXByaXNlOlwiXCIsXG5cdFx0XHRyZWR1Y3Rpb246e1xuXHRcdFx0XHRtb250YW50OjAsXG5cdFx0XHRcdHBlcmNlbnQ6MFxuXHRcdFx0fSx2YWxpZGU6dHJ1ZVxuXHRcdH07XG5cblx0XHQkcHJvbW90aW9uU2VydmljZS5nZXRBbGwoKS50aGVuKGZ1bmN0aW9uKHByb21vdGlvbnMpe1xuXHRcdFx0JHNjb3BlLnByb21vdGlvbnMgPSBhbmd1bGFyLmNvcHkocHJvbW90aW9ucyk7XG5cdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdGNvbnNvbGUud2FybihlcnIpO1xuXHRcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0XHR9KTtcblxuXG5cdFx0JGNsaWVudFNlcnZpY2UuZ2V0QWxsKCkudGhlbihmdW5jdGlvbihjbGllbnRzKXtcblx0XHRcdCRzY29wZS5jbGllbnRzID0gYW5ndWxhci5jb3B5KGNsaWVudHMpO1xuXHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRjb25zb2xlLndhcm4oZXJyKTtcblx0XHRcdHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG5cdFx0fSk7XG5cblxuXHRcdCRzY29wZS5hZGRQcm9tID0gZnVuY3Rpb24oKXtcblx0XHRcdCRwcm9tb3Rpb25TZXJ2aWNlLmFkZCgkc2NvcGUucHJvbW90aW9uKS50aGVuKGZ1bmN0aW9uKHByb20pe1xuXHRcdFx0XHQkc2NvcGUucHJvbW90aW9ucy5wdXNoKHByb20pO1xuXHRcdFx0XHQkc2NvcGUucHJvbW90aW9uID0ge1xuXHRcdFx0XHRcdGVudHJlcHJpc2U6XCJcIixcblx0XHRcdFx0XHRyZWR1Y3Rpb246e1xuXHRcdFx0XHRcdFx0bW9udGFudDowLFxuXHRcdFx0XHRcdFx0cGVyY2VudDowXG5cdFx0XHRcdFx0fSx2YWxpZGU6dHJ1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0Y29uc29sZS53YXJuKGVycik7XG5cdFx0XHRcdHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cblxuXHRcdCRzY29wZS5kZWxQcm9tID0gZnVuY3Rpb24ocHJvbSl7XG5cdFx0XHQkcHJvbW90aW9uU2VydmljZS5kZWxldGUocHJvbSkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHRcdFx0dmFyIGlkeCA9ICRzY29wZS5wcm9tb3Rpb25zLmluZGV4T2YocHJvbSk7XG5cdFx0XHRcdGlmKGlkeCAhPT0gLTEpXG5cdFx0XHRcdFx0JHNjb3BlLnByb21vdGlvbnMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRjb25zb2xlLndhcm4oZXJyKTtcblx0XHRcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblxuXG5cdFx0JHNjb3BlLm1vZGlmUHJvbSA9IGZ1bmN0aW9uKHByb20pe1xuXG5cdFx0XHQkc2NvcGUucHJvbW90aW9uLmVudHJlcHJpc2UgPSBwcm9tLmVudHJlcHJpc2U7XG5cdFx0XHQkc2NvcGUucHJvbW90aW9uLnJlZHVjdGlvbiA9IHByb20ucmVkdWN0aW9uO1xuXG5cdFx0XHQkcHJvbW90aW9uU2VydmljZS5tb2RpZigkc2NvcGUucHJvbW90aW9uKS50aGVuKGZ1bmN0aW9uKG5ld1Byb20pe1xuXHRcdFx0XHR2YXIgaWR4ID0gJHNjb3BlLnByb21vdGlvbnMuaW5kZXhPZihwcm9tKTtcblx0XHRcdFx0aWYoaWR4ICE9PSAtMSlcblx0XHRcdFx0XHQkc2NvcGUucHJvbW90aW9uc1tpZHhdID0gYW5ndWxhci5jb3B5KG5ld1Byb20pO1xuXG5cdFx0XHRcdCRzY29wZS5wcm9tb3Rpb24gPSB7XG5cdFx0XHRcdFx0ZW50cmVwcmlzZTpcIlwiLFxuXHRcdFx0XHRcdHJlZHVjdGlvbjp7XG5cdFx0XHRcdFx0XHRtb250YW50OjAsXG5cdFx0XHRcdFx0XHRwZXJjZW50OjBcblx0XHRcdFx0XHR9LHZhbGlkZTp0cnVlXG5cdFx0XHRcdH07XG5cdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRjb25zb2xlLndhcm4oZXJyKTtcblx0XHRcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblxuXG5cbn1dKTsiLCJcInVzZSBzdHJpY3RcIjtcblxubXlBcHAuY29udHJvbGxlcihcImFjY3VlaWxDdHJsXCIsIFtcbiAgXCIkc2NvcGVcIixcbiAgXCIkcm9vdFNjb3BlXCIsXG4gIFwiJHRpbWVvdXRcIixcbiAgXCJjbGllbnRTZXJ2aWNlXCIsXG4gIFwiY29tbWFuZGVTZXJ2aWNlXCIsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsICRjbGllbnRTZXJ2aWNlLCAkY29tbWFuZGVTZXJ2aWNlKSB7XG4gICAgJHNjb3BlLnpvbmVzID0gbmV3IEFycmF5KCk7XG4gICAgJHNjb3BlLnJlZ2lvbnMgPSBuZXcgQXJyYXkoKTtcbiAgICAoJHNjb3BlLnN1bU5ldCA9IDApLCAoJHNjb3BlLnN1bUJydXQgPSAwKSwgKCRzY29wZS50b3RhbCA9IDApO1xuICAgICRzY29wZS5jb21tYW5kZSA9IHt9O1xuICAgICRzY29wZS5pc090aGVyID0gZmFsc2U7XG4gICAgY29uc29sZS5sb2coJHNjb3BlLmlzT3RoZXIpO1xuXG4gICAgJGNsaWVudFNlcnZpY2UuZ2V0TWUoKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRzY29wZS5jbGllbnQgPSByZXAuY2xpZW50O1xuICAgICAgICAgICRzY29wZS5jb21tYW5kZSA9IHJlcC5jb21tYW5kZTtcbiAgICAgICAgICAkc2NvcGUuem9uZXMgPSByZXAuY29tbWFuZGUuem9uZXMubWFwKGZ1bmN0aW9uKHpvbmUpIHtcbiAgICAgICAgICAgIHZhciB2aWxsZU5hbWUgPSB6b25lW1wiVmlsbGVcIl0ucmVwbGFjZShcIl9cIiwgXCIgXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgVmlsbGU6IHpvbmVbXCJWaWxsZVwiXSxcbiAgICAgICAgICAgICAgbmFtZTogdmlsbGVOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB2aWxsZU5hbWUuc3Vic3RyKDEpLFxuICAgICAgICAgICAgICByZWdpb246IHpvbmVbXCJyZWdpb25cIl0sXG4gICAgICAgICAgICAgIGJydXQ6IHpvbmVbXCJicnV0XCJdLFxuICAgICAgICAgICAgICBuZXQ6IHpvbmVbXCJuZXRcIl1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdmFyIGZvcm1hdCA9ICRzY29wZS5jb21tYW5kZS5mb3JtYXQ7XG4gICAgICAgICAgaWYgKGZvcm1hdCAhPSBcIkE0XCIgJiYgZm9ybWF0ICE9IFwiQTVcIiAmJiBmb3JtYXQgIT0gXCJBNlwiKVxuICAgICAgICAgICAgJHNjb3BlLmZvcm1hdEF1dHJlID0gZm9ybWF0O1xuICAgICAgICAgICRzY29wZS5jYWxjU3VtKCk7XG4gICAgICAgICAgcnVuRGF0ZXBpY2tlcigpO1xuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfSwgMTUwKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgIHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgICRzY29wZS5jYWxjVG90YWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2FsYyBUb3RhbFwiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5jb21tYW5kZS56b25lcy5sZW5ndGgpO1xuICAgICAgJGNvbW1hbmRlU2VydmljZS5tb2RpZigkc2NvcGUuY29tbWFuZGUuX2lkLCAkc2NvcGUuY29tbWFuZGUpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKGNtZCkge1xuICAgICAgICAgICRzY29wZS5jb21tYW5kZS50b3RhbCA9IGNtZC50b3RhbDtcbiAgICAgICAgICAkc2NvcGUuY29tbWFuZGUudG90YWxIVCA9IGNtZC50b3RhbEhUO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IoZXJyLnN0YXR1c1RleHQpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUNvbW1hbmRlID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJzYXZlIGNtZFwiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5jb21tYW5kZS56b25lcy5sZW5ndGgpO1xuICAgICAgJGNvbW1hbmRlU2VydmljZS5tb2RpZigkc2NvcGUuY29tbWFuZGUuX2lkLCAkc2NvcGUuY29tbWFuZGUpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKGNtZCkge1xuICAgICAgICAgIGFuZ3VsYXIuY29weShjbWQsICRzY29wZS5jb21tYW5kZSk7XG4gICAgICAgICAgJHJvb3RTY29wZS5nbyhwYXRoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmFqb3V0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHZpbGxlTmFtZSA9IGRhdGFbXCJWaWxsZVwiXS5yZXBsYWNlKFwiX1wiLCBcIiBcIik7XG4gICAgICBkYXRhW1wibmFtZVwiXSA9IHZpbGxlTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgdmlsbGVOYW1lLnN1YnN0cigxKTtcbiAgICAgICRzY29wZS56b25lcy5wdXNoKGRhdGEpO1xuICAgICAgJHNjb3BlLmNvbW1hbmRlLnpvbmVzID0gYW5ndWxhci5jb3B5KCRzY29wZS56b25lcyk7XG4gICAgICAkc2NvcGUuY2FsY1N1bSgpO1xuICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWpvdXRNdWx0aSA9IGZ1bmN0aW9uKGRhdGEsIGFwcGx5KSB7XG4gICAgICBpZiAoYXBwbHkgPT0gdW5kZWZpbmVkKSBhcHBseSA9IGZhbHNlO1xuXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICB2YXIgdmlsbGVOYW1lID0gZFtcIlZpbGxlXCJdLnJlcGxhY2UoXCJfXCIsIFwiIFwiKTtcbiAgICAgICAgZFtcIm5hbWVcIl0gPSB2aWxsZU5hbWVbMF0udG9VcHBlckNhc2UoKSArIHZpbGxlTmFtZS5zdWJzdHIoMSk7XG5cbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS56b25lc1xuICAgICAgICAgIC5tYXAoZnVuY3Rpb24oem9uKSB7XG4gICAgICAgICAgICByZXR1cm4gem9uW1wiVmlsbGVcIl07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuaW5kZXhPZihkW1wiVmlsbGVcIl0pO1xuXG4gICAgICAgIGlmIChpZHggPT09IC0xKSAkc2NvcGUuem9uZXMucHVzaChkKTtcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmNvbW1hbmRlLnpvbmVzID0gYW5ndWxhci5jb3B5KCRzY29wZS56b25lcyk7XG4gICAgICAkc2NvcGUuY2FsY1N1bSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24oZGF0YSwgYXBwbHkpIHtcbiAgICAgIGlmIChhcHBseSA9PSB1bmRlZmluZWQpIGFwcGx5ID0gZmFsc2U7XG4gICAgICB2YXIgaWR4ID0gJHNjb3BlLnpvbmVzXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oem9uKSB7XG4gICAgICAgICAgcmV0dXJuIHpvbltcIlZpbGxlXCJdO1xuICAgICAgICB9KVxuICAgICAgICAuaW5kZXhPZihkYXRhW1wiVmlsbGVcIl0pO1xuICAgICAgaWYgKGlkeCAhPT0gLTEpICRzY29wZS56b25lcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICRzY29wZS5jb21tYW5kZS56b25lcyA9IGFuZ3VsYXIuY29weSgkc2NvcGUuem9uZXMpO1xuICAgICAgJHNjb3BlLmNhbGNTdW0oKTtcbiAgICAgIGlmIChhcHBseSkgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH07XG5cbiAgICAkc2NvcGUucmVtb3ZlTXVsdGkgPSBmdW5jdGlvbihkYXRhLCBhcHBseSkge1xuICAgICAgaWYgKGFwcGx5ID09IHVuZGVmaW5lZCkgYXBwbHkgPSBmYWxzZTtcblxuICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS56b25lc1xuICAgICAgICAgIC5tYXAoZnVuY3Rpb24oem9uKSB7XG4gICAgICAgICAgICByZXR1cm4gem9uW1wiVmlsbGVcIl07XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuaW5kZXhPZihkW1wiVmlsbGVcIl0pO1xuICAgICAgICBpZiAoaWR4ICE9PSAtMSkgJHNjb3BlLnpvbmVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuY29tbWFuZGUuem9uZXMgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnpvbmVzKTtcbiAgICAgICRzY29wZS5jYWxjU3VtKCk7XG4gICAgICBpZiAoYXBwbHkpICRzY29wZS4kYXBwbHkoKTtcbiAgICAgIHJldHVybjtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNhbGNTdW0gPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUuem9uZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgJHNjb3BlLnN1bUJydXQgPSAwO1xuICAgICAgICAkc2NvcGUuc3VtTmV0ID0gMDtcbiAgICAgICAgJHNjb3BlLmNhbGNUb3RhbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zdW1CcnV0ID0gJHNjb3BlLnpvbmVzXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGNbXCJicnV0XCJdKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEgKyBiO1xuICAgICAgICB9KTtcbiAgICAgICRzY29wZS5zdW1OZXQgPSAkc2NvcGUuem9uZXNcbiAgICAgICAgLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoY1tcIm5ldFwiXSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgICAgfSk7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKFwiI2xpc3RWaWxsZVwiKS5zY3JvbGxUb3AoJChcIiNsaXN0VmlsbGUgPiB0YWJsZVwiKS5oZWlnaHQoKSk7XG4gICAgICAgIC8vICRzY29wZS5hcHBseSgpO1xuICAgICAgfSwgMTApO1xuXG4gICAgICAkc2NvcGUuY2FsY1RvdGFsKCk7XG4gICAgICAkc2NvcGUuY2hhbmdlTWFwKCk7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgICRzY29wZS5jaGFuZ2VNYXAgPSBmdW5jdGlvbihlKSB7XG4gICAgICAkc2NvcGUucmVnaW9ucyA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc29sZS5sb2coXCJMT09HXCIsICRzY29wZSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwib3Vlc3RcIiwgJHNjb3BlW1wib3Vlc3RcIl0pO1xuICAgICAgY29uc29sZS5sb2coXCJub3JkXCIsICRzY29wZVtcIm5vcmRcIl0pO1xuICAgICAgY29uc29sZS5sb2coXCJlc3RcIiwgJHNjb3BlW1wiZXN0XCJdKTtcbiAgICAgIGNvbnNvbGUubG9nKFwic3VkLWVzdFwiLCAkc2NvcGVbXCJzdWQtZXN0XCJdKTtcbiAgICAgIGNvbnNvbGUubG9nKFwic3VkXCIsICRzY29wZVtcInN1ZFwiXSk7XG4gICAgICBjb25zb2xlLmxvZyhcInN1ZC1vdWVzdFwiLCAkc2NvcGVbXCJzdWQtb3Vlc3RcIl0pO1xuXG4gICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgIGlmICgkc2NvcGUubmF0aW9uYWwpIHtcbiAgICAgICAgLy8gJHNjb3BlLm5vcmQgPSB0cnVlO1xuICAgICAgICAvLyAkc2NvcGUuZXN0ID0gdHJ1ZTtcbiAgICAgICAgLy8gJHNjb3BlLnN1ZCA9IHRydWU7XG4gICAgICAgIC8vICRzY29wZS5jZW50cmUgPSB0cnVlO1xuICAgICAgICAkc2NvcGVbXCJvdWVzdFwiXSA9IHRydWU7XG4gICAgICAgICRzY29wZVtcIm5vcmRcIl0gPSB0cnVlO1xuICAgICAgICAkc2NvcGVbXCJlc3RcIl0gPSB0cnVlO1xuICAgICAgICAkc2NvcGVbXCJzdWQtZXN0XCJdID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlW1wic3VkXCJdID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlW1wic3VkLW91ZXN0XCJdID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoZSAmJiBlLnRhcmdldC5pZCA9PSBcIm5hdGlvbmFsXCIpIHtcbiAgICAgICAgLy8gJHNjb3BlLm5vcmQgPSBmYWxzZTtcbiAgICAgICAgLy8gJHNjb3BlLmVzdCA9IGZhbHNlO1xuICAgICAgICAvLyAkc2NvcGUuc3VkID0gZmFsc2U7XG4gICAgICAgIC8vICRzY29wZS5jZW50cmUgPSBmYWxzZTtcbiAgICAgICAgLy8gJHNjb3BlLmNlbnRyZSA9IHRydWU7XG4gICAgICAgICRzY29wZVtcIm91ZXN0XCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcIm5vcmRcIl0gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlW1wiZXN0XCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcInN1ZC1lc3RcIl0gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlW1wic3VkXCJdID0gZmFsc2U7XG4gICAgICAgICRzY29wZVtcInN1ZC1vdWVzdFwiXSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gaWYgKCRzY29wZS5ub3JkKSAkc2NvcGUucmVnaW9ucy5wdXNoKFwiTm9yZCAvIG5vcmRlblwiKTtcbiAgICAgIC8vIGlmICgkc2NvcGUuZXN0KSAkc2NvcGUucmVnaW9ucy5wdXNoKFwiRXN0IC8gb3N0ZW5cIik7XG4gICAgICAvLyBpZiAoJHNjb3BlLnN1ZCkgJHNjb3BlLnJlZ2lvbnMucHVzaChcIlN1ZCAvIHN1ZGVuXCIpO1xuICAgICAgLy8gaWYgKCRzY29wZS5jZW50cmUpICRzY29wZS5yZWdpb25zLnB1c2goXCJDZW50cmUgLyB6ZW50cnVtXCIpO1xuICAgICAgaWYgKCRzY29wZVtcIm91ZXN0XCJdKSAkc2NvcGUucmVnaW9ucy5wdXNoKFwib3Vlc3RcIik7XG4gICAgICBpZiAoJHNjb3BlW1wibm9yZFwiXSkgJHNjb3BlLnJlZ2lvbnMucHVzaChcIm5vcmRcIik7XG4gICAgICBpZiAoJHNjb3BlW1wiZXN0XCJdKSAkc2NvcGUucmVnaW9ucy5wdXNoKFwiZXN0XCIpO1xuICAgICAgaWYgKCRzY29wZVtcInN1ZC1lc3RcIl0pICRzY29wZS5yZWdpb25zLnB1c2goXCJzdWQtZXN0XCIpO1xuICAgICAgaWYgKCRzY29wZVtcInN1ZFwiXSkgJHNjb3BlLnJlZ2lvbnMucHVzaChcInN1ZFwiKTtcbiAgICAgIGlmICgkc2NvcGVbXCJzdWQtb3Vlc3RcIl0pICRzY29wZS5yZWdpb25zLnB1c2goXCJzdWQtb3Vlc3RcIik7XG5cbiAgICAgIHJldHVybjtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmFkZFJlZ2lvbiA9IGZ1bmN0aW9uKG5hbWUsIGFwcGx5KSB7XG4gICAgICBpZiAoYXBwbHkgPT0gdW5kZWZpbmVkKSBhcHBseSA9IGZhbHNlO1xuXG4gICAgICAvLyBpZiAobmFtZSA9PSBcIk5vcmQgLyBub3JkZW5cIikgJHNjb3BlLm5vcmQgPSB0cnVlO1xuICAgICAgLy8gaWYgKG5hbWUgPT0gXCJFc3QgLyBvc3RlblwiKSAkc2NvcGUuZXN0ID0gdHJ1ZTtcbiAgICAgIC8vIGlmIChuYW1lID09IFwiU3VkIC8gc3VkZW5cIikgJHNjb3BlLnN1ZCA9IHRydWU7XG4gICAgICAvLyBpZiAobmFtZSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIikgJHNjb3BlLmNlbnRyZSA9IHRydWU7XG4gICAgICBpZiAobmFtZSA9PT0gXCJvdWVzdFwiKSAkc2NvcGVbXCJvdWVzdFwiXSA9IHRydWU7XG4gICAgICBpZiAobmFtZSA9PT0gXCJub3JkXCIpICRzY29wZVtcIm5vcmRcIl0gPSB0cnVlO1xuICAgICAgaWYgKG5hbWUgPT09IFwiZXN0XCIpICRzY29wZVtcImVzdFwiXSA9IHRydWU7XG4gICAgICBpZiAobmFtZSA9PT0gXCJzdWQtZXN0XCIpICRzY29wZVtcInN1ZC1lc3RcIl0gPSB0cnVlO1xuICAgICAgaWYgKG5hbWUgPT09IFwic3VkXCIpICRzY29wZVtcInN1ZFwiXSA9IHRydWU7XG4gICAgICBpZiAobmFtZSA9PT0gXCJzdWQtb3Vlc3RcIikgJHNjb3BlW1wic3VkLW91ZXN0XCJdID0gdHJ1ZTtcblxuICAgICAgaWYgKFxuICAgICAgICAkc2NvcGVbXCJvdWVzdFwiXSAmJlxuICAgICAgICAkc2NvcGVbXCJub3JkXCJdICYmXG4gICAgICAgICRzY29wZVtcImVzdFwiXSAmJlxuICAgICAgICAkc2NvcGVbXCJzdWQtZXN0XCJdICYmXG4gICAgICAgICRzY29wZVtcInN1ZFwiXSAmJlxuICAgICAgICAkc2NvcGVbXCJzdWQtb3Vlc3RcIl1cbiAgICAgIClcbiAgICAgICAgJHNjb3BlLm5hdGlvbmFsID0gdHJ1ZTtcbiAgICAgIGVsc2UgJHNjb3BlLm5hdGlvbmFsID0gZmFsc2U7XG5cbiAgICAgICRzY29wZS5jaGFuZ2VNYXAoZmFsc2UpO1xuICAgICAgaWYgKGFwcGx5KSAkc2NvcGUuJGFwcGx5KCk7XG4gICAgfTtcbiAgfVxuXSk7XG5cbm15QXBwLmNvbnRyb2xsZXIoXCJjb21tYW5kZUN0cmxcIiwgW1xuICBcIiRzY29wZVwiLFxuICBcIiRyb290U2NvcGVcIixcbiAgXCJjbGllbnRTZXJ2aWNlXCIsXG4gIFwiY29tbWFuZGVTZXJ2aWNlXCIsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGNsaWVudFNlcnZpY2UsICRjb21tYW5kZVNlcnZpY2UpIHtcbiAgICAkc2NvcGUuY2xpZW50ID0ge307XG4gICAgJHNjb3BlLmNvbW1hbmRlID0ge307XG4gICAgJHNjb3BlLnpvbmVzID0gW107XG4gICAgJHNjb3BlLnBhdGggPSBcIlwiO1xuXG4gICAgJGNsaWVudFNlcnZpY2UuZ2V0TWUoKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgICRzY29wZS5jbGllbnQgPSByZXAuY2xpZW50O1xuICAgICAgICAkc2NvcGUuY29tbWFuZGUgPSByZXAuY29tbWFuZGU7XG4gICAgICAgICRzY29wZS56b25lcyA9IGFuZ3VsYXIuY29weShyZXAuY29tbWFuZGUuem9uZXMpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgJHNjb3BlLnNhdmVDbGllbnQgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICBpZiAoIXBhdGggfHwgcGF0aCA9PT0gdW5kZWZpbmVkKSBwYXRoID0gJHNjb3BlLnBhdGg7XG4gICAgICAkY2xpZW50U2VydmljZVxuICAgICAgICAubW9kaWYoJHNjb3BlLmNsaWVudC5faWQsICRzY29wZS5jbGllbnQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGNsaWVudCkge1xuICAgICAgICAgIGFuZ3VsYXIuY29weShjbGllbnQsICRzY29wZS5jbGllbnQpO1xuICAgICAgICAgICRyb290U2NvcGUuZ28ocGF0aCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH1cbl0pO1xuXG5teUFwcC5jb250cm9sbGVyKFwicGFpZW1lbnRDdHJsXCIsIFtcbiAgXCIkc2NvcGVcIixcbiAgXCIkbG9jYXRpb25cIixcbiAgXCIkcm9vdFNjb3BlXCIsXG4gIFwiY2xpZW50U2VydmljZVwiLFxuICBcImNvbW1hbmRlU2VydmljZVwiLFxuICBcInBhaWVtZW50U2VydmljZVwiLFxuICBmdW5jdGlvbihcbiAgICAkc2NvcGUsXG4gICAgJGxvY2F0aW9uLFxuICAgICRyb290U2NvcGUsXG4gICAgJGNsaWVudFNlcnZpY2UsXG4gICAgJGNvbW1hbmRlU2VydmljZSxcbiAgICAkcGFpZW1lbnRTZXJ2aWNlXG4gICkge1xuICAgICRzY29wZS5jbGllbnQgPSB7XG4gICAgICBlbnRyZXByaXNlOiBcIlwiLFxuICAgICAgYWRyZXNzZTogXCJcIixcbiAgICAgIHZpbGxlOiBcIlwiLFxuICAgICAgcGF5czogXCJcIixcbiAgICAgIGFjdGl2aXTDqTogXCJcIixcbiAgICAgIHRlbGVwaG9uZTogXCJcIixcbiAgICAgIHR2YTogXCJcIlxuICAgIH07XG5cbiAgICAkc2NvcGUuY29tbWFuZGUgPSB7XG4gICAgICBpbnRpdHVsZTogXCJcIixcbiAgICAgIHBvaWQ6IFwiXCIsXG4gICAgICBmb3JtYXQ6IFwiXCIsXG4gICAgICBjb250ZW51OiBcIlwiLFxuICAgICAgc2VtYWluZTogXCJcIixcbiAgICAgIHRvdGFsOiAwXG4gICAgfTtcblxuICAgIHZhciBob3N0TmFtZSA9XG4gICAgICAkbG9jYXRpb24ucHJvdG9jb2woKSArXG4gICAgICBcIjovL1wiICtcbiAgICAgICRsb2NhdGlvbi5ob3N0KCkgK1xuICAgICAgXCI6XCIgK1xuICAgICAgJGxvY2F0aW9uLnBvcnQoKSArXG4gICAgICBcIi9cIjtcblxuICAgICRzY29wZS5wYWllbWVudCA9IHtcbiAgICAgIG1vbnRhbnQ6IDAsXG4gICAgICBwZXJjZW50OiAkc2NvcGUuZnJhaXMsXG4gICAgICBjYXJkUmVnaXN0cmF0aW9uOiB7XG4gICAgICAgIEFjY2Vzc0tleTogXCJcIixcbiAgICAgICAgQ2FyZFJlZ2lzdHJhdGlvblVSTDogaG9zdE5hbWUsXG4gICAgICAgIENhcmRUeXBlOiBcIlwiLFxuICAgICAgICBQcmVyZWdpc3RyYXRpb25EYXRhOiBcIlwiLFxuICAgICAgICByZXR1cm5VUkw6IGhvc3ROYW1lICsgXCJyZWdsZW1lbnRcIlxuICAgICAgfSxcbiAgICAgIGNyeXB0bzogXCJcIixcbiAgICAgIGRhdGU6IHsgbW9pczogMSwgeWVhcjogMjAxOCB9XG4gICAgfTtcblxuICAgICRzY29wZS5lbkNvdXJzID0gZmFsc2U7XG5cbiAgICAkY2xpZW50U2VydmljZS5nZXRNZSgpLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXApIHtcbiAgICAgICAgJHNjb3BlLmNsaWVudCA9IHJlcC5jbGllbnQ7XG4gICAgICAgICRzY29wZS5jb21tYW5kZSA9IHJlcC5jb21tYW5kZTtcbiAgICAgICAgYW5ndWxhci5jb3B5KHJlcC5jb21tYW5kZS56b25lcywgJHNjb3BlLnpvbmVzKTtcbiAgICAgICAgYW5ndWxhci5jb3B5KHJlcC5jb21tYW5kZS50b3RhbCwgJHNjb3BlLnBhaWVtZW50Lm1vbnRhbnQpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgJHNjb3BlLnNhdmVDYXJkID0gZnVuY3Rpb24oY2FyZCkge1xuICAgICAgcmV0dXJuICRwYWllbWVudFNlcnZpY2Uuc2F2ZUNhcmQoY2FyZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihlcnIpO1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyAkc2NvcGUuc2F2ZUNsaWVudCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBcdCQoXCIjYnRuX3BhaWVtZW50XCIpLnZhbChcIi4uLiBWYWxpZGF0aW9uIGVuIGNvdXJzIC4uLlwiKTtcbiAgICAvLyBcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gXHQkY2xpZW50U2VydmljZS5tb2RpZigkc2NvcGUuY2xpZW50Ll9pZCwgJHNjb3BlLmNsaWVudCkudGhlbihmdW5jdGlvbihjbGllbnQpe1xuICAgIC8vIFx0XHRhbmd1bGFyLmNvcHkoY2xpZW50LCAkc2NvcGUuY2xpZW50KTtcbiAgICAvLyBcdFx0JHBhaWVtZW50U2VydmljZS5hZGQoJHNjb3BlLnBhaWVtZW50KS50aGVuKGZ1bmN0aW9uKGNsaWVudCl7XG4gICAgLy8gXHRcdFx0JHNjb3BlLnBhaWVtZW50LmNhcmRSZWdpc3RyYXRpb24uQWNjZXNzS2V5ID0gY2xpZW50LmNhcmRSZWdpc3RyYXRpb24uQWNjZXNzS2V5O1xuICAgIC8vIFx0XHRcdCRzY29wZS5wYWllbWVudC5jYXJkUmVnaXN0cmF0aW9uLkNhcmRSZWdpc3RyYXRpb25VUkwgPSBjbGllbnQuY2FyZFJlZ2lzdHJhdGlvbi5DYXJkUmVnaXN0cmF0aW9uVVJMO1xuICAgIC8vIFx0XHRcdCRzY29wZS5wYWllbWVudC5jYXJkUmVnaXN0cmF0aW9uLkNhcmRUeXBlID0gY2xpZW50LmNhcmRSZWdpc3RyYXRpb24uQ2FyZFR5cGU7XG4gICAgLy8gXHRcdFx0JHNjb3BlLnBhaWVtZW50LmNhcmRSZWdpc3RyYXRpb24uUHJlcmVnaXN0cmF0aW9uRGF0YSA9IGNsaWVudC5jYXJkUmVnaXN0cmF0aW9uLlByZXJlZ2lzdHJhdGlvbkRhdGE7XG4gICAgLy8gXHRcdFx0Ly8gJHNjb3BlLiRhcHBseSgpO1xuICAgIC8vIFx0XHRcdCQoXCIjYnRuX3BhaWVtZW50XCIpLnZhbChcIi4uLiBQYWllbWVudCBlbiBjb3VycyAuLi5cIik7XG4gICAgLy8gXHRcdFx0ZXZlbnQudGFyZ2V0LnN1Ym1pdCgpO1xuICAgIC8vIFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuICAgIC8vIFx0XHRcdGNvbnNvbGUud2FybihlcnIpO1xuICAgIC8vIFx0XHRcdHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgLy8gXHRcdH0pXG4gICAgLy8gXHR9LCBmdW5jdGlvbihlcnIpe1xuICAgIC8vIFx0XHRjb25zb2xlLndhcm4oZXJyKTtcbiAgICAvLyBcdFx0dG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcbiAgICAvLyBcdH0pO1xuICAgIC8vIH1cblxuICAgICRzY29wZS5tb2lzID0gXy5yYW5nZSgxLCAxMykubWFwKGZ1bmN0aW9uKG4pIHtcbiAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgIGQuc2V0TW9udGgobik7XG4gICAgICByZXR1cm4gbiA9PSAxMiA/IFwiMTJcIiA6IG4gPCAxMCA/IFwiMFwiICsgZC5nZXRNb250aCgpIDogZC5nZXRNb250aCgpO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnllYXJzID0gXy5yYW5nZSgxNSkubWFwKGZ1bmN0aW9uKG4pIHtcbiAgICAgIHZhciBkID0gbmV3IERhdGUoKTtcbiAgICAgIGQuc2V0WWVhcihkLmdldEZ1bGxZZWFyKCkgKyBuKTtcbiAgICAgIHJldHVybiBkLmdldEZ1bGxZZWFyKCk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUudHlwZUNhcmQgPSBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgdmFsID0gJHNjb3BlLnBhaWVtZW50LmNhcnRlO1xuICAgICAgdmFyIG5ld3ZhbCA9IFwiXCI7XG4gICAgICB2YWwgPSB2YWwucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgJSA0ID09IDAgJiYgaSA+IDApIG5ld3ZhbCA9IG5ld3ZhbC5jb25jYXQoXCIgXCIpO1xuICAgICAgICBuZXd2YWwgPSBuZXd2YWwuY29uY2F0KHZhbFtpXSk7XG4gICAgICB9XG4gICAgICAkc2NvcGUucGFpZW1lbnQuY2FydGUgPSBuZXd2YWw7XG4gICAgfTtcbiAgfVxuXSk7XG5cbm15QXBwLmNvbnRyb2xsZXIoXCJ2YWxpZGF0aW9uQ3RybFwiLCBbXG4gIFwiJHNjb3BlXCIsXG4gIFwiJHJvb3RTY29wZVwiLFxuICBcIiR0aW1lb3V0XCIsXG4gIFwiY29tbWFuZGVTZXJ2aWNlXCIsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsICRjb21tYW5kZVNlcnZpY2UpIHtcbiAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGNvbW1hbmRlU2VydmljZS5jbGVhcigpO1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRyb290U2NvcGUuZ28oXCIvXCIpO1xuICAgICAgfSwgMjUwMCk7XG4gICAgfTtcblxuICAgICRjb21tYW5kZVNlcnZpY2UuZW1haWwoKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVwKSB7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgIHRvYXN0ci5lcnJvcihlcnIuc3RhdHVzVGV4dCk7XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5dKTtcblxubXlBcHAuY29udHJvbGxlcihcInJlZ2xlbWVudEN0cmxcIiwgW1xuICBcIiRzY29wZVwiLFxuICBcIiRsb2NhdGlvblwiLFxuICBcIiR0aW1lb3V0XCIsXG4gIFwiY29tbWFuZGVTZXJ2aWNlXCIsXG4gIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCAkdGltZW91dCwgJGNvbW1hbmRlU2VydmljZSkge1xuICAgIHZhciBuZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkY29tbWFuZGVTZXJ2aWNlLmNsZWFyKCk7XG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHJvb3RTY29wZS5nbyhcIi9cIik7XG4gICAgICB9LCAyNTAwKTtcbiAgICB9O1xuXG4gICAgJGNvbW1hbmRlU2VydmljZS5lbWFpbCgpLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXApIHtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oZXJyKTtcbiAgICAgICAgdG9hc3RyLmVycm9yKGVyci5zdGF0dXNUZXh0KTtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfVxuICAgICk7XG4gIH1cbl0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm15QXBwLmRpcmVjdGl2ZShcImQzTWFwXCIsIFtcbiAgXCIkdGltZW91dFwiLFxuICBcIiR3aW5kb3dcIixcbiAgZnVuY3Rpb24oJHRpbWVvdXQsICR3aW5kb3cpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgbWFwOiBcIkBcIixcbiAgICAgICAgY2l0aWVzOiBcIkBcIixcbiAgICAgICAgcmVnaW9uczogXCI9XCIsXG4gICAgICAgIHpvbmVzRGF0YTogXCI9XCIsXG4gICAgICAgIHdpZHRoOiBcIkBcIixcbiAgICAgICAgaGVpZ2h0OiBcIkBcIixcbiAgICAgICAgY3RybEFqb3V0OiBcIj1cIixcbiAgICAgICAgY3RybFJlbW92ZTogXCI9XCIsXG4gICAgICAgIGN0cmxBam91dE11bHRpOiBcIj1cIixcbiAgICAgICAgY3RybFJlbW92ZU11bHRpOiBcIj1cIixcbiAgICAgICAgY3RybFJlZ2lvbkFjdGlmOiBcIj1cIlxuICAgICAgfSxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKSB7XG4gICAgICAgIC8vIFZhbGV1cnMgcGFyIGTDqWZhdWx0XG5cbiAgICAgICAgdmFyIG1hcmdpbiA9IHsgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwIH0sXG4gICAgICAgICAgd2lkdGggPSBkMy5zZWxlY3QoZWxlWzBdKS5ub2RlKCkub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgd2lkdGggPSBzY29wZS53aWR0aCA9PT0gdW5kZWZpbmVkID8gd2lkdGggOiBzY29wZS53aWR0aCxcbiAgICAgICAgICB3aWR0aCA9IHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQsXG4gICAgICAgICAgaGVpZ2h0ID0gc2NvcGUuaGVpZ2h0ID09PSB1bmRlZmluZWQgPyAyMDAwIDogc2NvcGUuaGVpZ2h0LFxuICAgICAgICAgIGhlaWdodCA9IGhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLFxuICAgICAgICAgIG1hcCA9IHNjb3BlLm1hcCA9PT0gdW5kZWZpbmVkID8gXCJMdXhlbWJvdXJnLnN2Z1wiIDogc2NvcGUubWFwLFxuICAgICAgICAgIGNpdGllcyA9IHNjb3BlLmNpdGllcyA9PT0gdW5kZWZpbmVkID8gXCJDb21tdW5lLnRzdlwiIDogc2NvcGUuY2l0aWVzLFxuICAgICAgICAgIHJlZ2lvbnMgPSBzY29wZS5yZWdpb25zID09PSB1bmRlZmluZWQgPyBuZXcgQXJyYXkoKSA6IHNjb3BlLnJlZ2lvbnM7XG5cbiAgICAgICAgc2NvcGUuZGF0YSA9IG51bGw7XG4gICAgICAgIHNjb3BlLnpvbmVzRGF0YSA9IG5ldyBBcnJheSgpO1xuICAgICAgICBzY29wZS5wYXRocyA9IG5ldyBBcnJheSgpO1xuXG4gICAgICAgIC8vIHZhciBjb2xvckNlbnRyZSA9IFwiIzVkMjQ5MVwiLFxuICAgICAgICAvLyAgIGNvbG9yU3VkID0gXCIjYzAxYTJjXCIsXG4gICAgICAgIC8vICAgY29sb3JFc3QgPSBcIiMzODcxYzJcIixcbiAgICAgICAgLy8gICBjb2xvck5vcmQgPSBcIiNmYmJkMTNcIjtcbiAgICAgICAgdmFyIGNvbG9yQ2VudHJlID0gXCIjNWQyNDkxXCIsXG4gICAgICAgICAgY29sb3JTdWQgPSBcIiNjMDFhMmNcIixcbiAgICAgICAgICBjb2xvckVzdCA9IFwiIzM4NzFjMlwiLFxuICAgICAgICAgIGNvbG9yTm9yZCA9IFwiI2ZiYmQxM1wiO1xuXG4gICAgICAgIHdpZHRoID0gZDMuc2VsZWN0KGVsZVswXSkubm9kZSgpLm9mZnNldFdpZHRoO1xuXG4gICAgICAgIHZhciBzdmcgPSBkM1xuICAgICAgICAgIC5zZWxlY3QoZWxlWzBdKVxuICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cbiAgICAgICAgdmFyIGZvcm1hdE51bWJlciA9IGQzLmZvcm1hdChcIi4xZlwiKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB3aWR0aCA9IGQzLnNlbGVjdChlbGVbMF0pLm5vZGUoKS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICBzdmcuYXR0cihcIndpZHRoXCIsIHdpZHRoKTtcbiAgICAgICAgICBkMy5zZWxlY3QoXCJnXCIpLnJlbW92ZSgpO1xuICAgICAgICAgIHNjb3BlLnJlbmRlcihzY29wZS5tYXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goXG4gICAgICAgICAgXCJtYXBcIixcbiAgICAgICAgICBmdW5jdGlvbihuZXdEYXRhLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgc2NvcGUucmVuZGVyKG5ld0RhdGEpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICBcImNpdGllc1wiLFxuICAgICAgICAgIGZ1bmN0aW9uKG5ld0RhdGEsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkRmlsZShuZXdEYXRhKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcblxuICAgICAgICBzY29wZS4kd2F0Y2goXG4gICAgICAgICAgXCJyZWdpb25zXCIsXG4gICAgICAgICAgZnVuY3Rpb24obmV3RGF0YSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB6b25lUmVtb3ZlcyA9IG5ldyBBcnJheSgpO1xuICAgICAgICAgICAgdmFyIHpvbmVBam91dHMgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgICAgIHNjb3BlLnJlZ2lvbnMgPSBhbmd1bGFyLmNvcHkobmV3RGF0YSk7XG4gICAgICAgICAgICB2YXIgem9uZXNEZWphID0gYW5ndWxhci5jb3B5KHNjb3BlLnpvbmVzRGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChvbGRWYWx1ZSA9PT0gdW5kZWZpbmVkKSBvbGRWYWx1ZSA9IG5ldyBBcnJheSgpO1xuXG4gICAgICAgICAgICBzY29wZS5wYXRocy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgdmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG5cbiAgICAgICAgICAgICAgdmFyIGlkeFpvbmUgPSB6b25lc0RlamFcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uKHopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB6W1wiVmlsbGVcIl07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuaW5kZXhPZihkYXRhW1wiVmlsbGVcIl0pO1xuXG4gICAgICAgICAgICAgIGlmIChzY29wZS5yZWdpb25zLmluZGV4T2YoXCJuYXRpb25hbFwiKSAhPT0gLTEgJiYgaWR4Wm9uZSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB6b25lc0RlamEucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICB6b25lQWpvdXRzLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgc2NvcGUucmVnaW9ucy5pbmRleE9mKGRhdGFbXCJyZWdpb25cIl0pICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgIGlkeFpvbmUgPT09IC0xXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHpvbmVzRGVqYS5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgIHpvbmVBam91dHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBvbGRWYWx1ZS5pbmRleE9mKGRhdGFbXCJyZWdpb25cIl0pICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgIHNjb3BlLnJlZ2lvbnMuaW5kZXhPZihkYXRhW1wicmVnaW9uXCJdKSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICBpZHhab25lICE9PSAtMVxuICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB6b25lc0RlamEuc3BsaWNlKGlkeFpvbmUsIDEpO1xuICAgICAgICAgICAgICAgIHpvbmVSZW1vdmVzLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS5wYXRocy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgdmFyIGlkID0gcC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG5cbiAgICAgICAgICAgICAgaWYgKHpvbmVzRGVqYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gWm9uZXMgc8OpbGVjdGlvbm5lclxuXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgem9uZXNEZWphXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oeikge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB6W1wiVmlsbGVcIl07XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5pbmRleE9mKGRhdGFbXCJWaWxsZVwiXSkgIT09IC0xXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBwLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhBY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvckNlbnRyZSk7XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiU3VkIC8gc3VkZW5cIilcbiAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoUmVnaW9uXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHNjb3BlLnpvbmVzRGF0YSA9IGFuZ3VsYXIuY29weSh6b25lc0RlamEpO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmVnaW9uV2F0Y2gnKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHpvbmVBam91dHMubGVuZ3RoKVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coem9uZVJlbW92ZXMubGVuZ3RoKVxuXG4gICAgICAgICAgICAvLyBham91dHMgb3Ugc3VwcHJlc3Npb24gZGFucyBkb25uw6llc1xuXG4gICAgICAgICAgICBpZiAoem9uZUFqb3V0cy5sZW5ndGggPiAwKSBzY29wZS5jdHJsQWpvdXRNdWx0aSh6b25lQWpvdXRzKTtcbiAgICAgICAgICAgIGlmICh6b25lUmVtb3Zlcy5sZW5ndGggPiAwKSBzY29wZS5jdHJsUmVtb3ZlTXVsdGkoem9uZVJlbW92ZXMpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChcbiAgICAgICAgICBcInpvbmVzRGF0YVwiLFxuICAgICAgICAgIGZ1bmN0aW9uKG5ld0RhdGEsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhvbGRWYWx1ZSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuZXdEYXRhKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNjb3BlLnpvbmVzRGF0YURhdGEpO1xuXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIHpvbmVzRGVqYSA9IGFuZ3VsYXIuY29weShuZXdEYXRhKTtcblxuICAgICAgICAgICAgICAvLyBzY29wZS5wYXRocy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGgpe1xuXG4gICAgICAgICAgICAgIC8vIFx0dmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgIC8vIFx0dmFyIGRhdGEgPSBzY29wZS5kYXRhW2lkXTtcblxuICAgICAgICAgICAgICAvLyBcdGlmKHNjb3BlLnJlZ2lvbnMuaW5kZXhPZignbmF0aW9uYWwnKSAhPT0gLTEgJiYgc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgLy8gXHRcdC8vIHBhcyBkYW5zIGxlcyB6b25lcyBldCBuYXRpb25hbFxuICAgICAgICAgICAgICAvLyBcdFx0c2NvcGUuem9uZXNEYXRhLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgIC8vIFx0fWVsc2UgaWYoc2NvcGUucmVnaW9ucy5pbmRleE9mKGRhdGFbJ3JlZ2lvbiddKSAhPT0gLTEgJiYgc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSkgPT09IC0xKXtcbiAgICAgICAgICAgICAgLy8gXHRcdC8vIHBhcyBkYW5zIGxlcyB6b25lcyBldCBkYW5zIGxhIHJlZ2lvblxuICAgICAgICAgICAgICAvLyBcdFx0c2NvcGUuem9uZXNEYXRhLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgIC8vIFx0fWVsc2UgaWYob2xkVmFsdWUuaW5kZXhPZihkYXRhWydyZWdpb24nXSkgIT09IC0xICYmIHNjb3BlLnpvbmVzRGF0YS5pbmRleE9mKGRhdGEpICE9PSAtMSl7XG4gICAgICAgICAgICAgIC8vIFx0XHR2YXIgaWR4ID0gc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSk7XG4gICAgICAgICAgICAgIC8vIFx0XHRpZihpZHggIT09IC0xKXtcbiAgICAgICAgICAgICAgLy8gXHRcdFx0c2NvcGUuem9uZXNEYXRhLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgICAvLyBcdFx0fVxuICAgICAgICAgICAgICAvLyBcdH07XG4gICAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICAgIC8vIENvdWxldXIgZGVzIHpvbmVzXG4gICAgICAgICAgICAgIHNjb3BlLnBhdGhzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IHAuYXR0cihcImlkXCIpO1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgaWYgKHpvbmVzRGVqYS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHpvbmVzRGVqYVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oeikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpbXCJWaWxsZVwiXTtcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgIC5pbmRleE9mKGRhdGFbXCJWaWxsZVwiXSkgIT09IC0xXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoQWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgICAgICBwLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIkVzdCAvIG9zdGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgcC5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJTdWQgLyBzdWRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIHAuYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgIHAuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoUmVnaW9uXCIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIikuYXR0cihcImNsYXNzXCIsIFwicGF0aFJlZ2lvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIFJlY2hlcmNoZSBkZSByw6lnaW9ucyBFbnRpZXJlbWVudCBBY3RpdmVzXG5cbiAgICAgICAgICAgICAgdmFyIHJlZ2lvbnMgPSBbXG4gICAgICAgICAgICAgICAgXCJvdWVzdFwiLFxuICAgICAgICAgICAgICAgIFwibm9yZFwiLFxuICAgICAgICAgICAgICAgIFwiZXN0XCIsXG4gICAgICAgICAgICAgICAgXCJzdWQgLyBlc3RcIixcbiAgICAgICAgICAgICAgICBcInN1ZFwiLFxuICAgICAgICAgICAgICAgIFwic3VkIC8gb3Vlc3RcIlxuICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgIHJlZ2lvbnMuZm9yRWFjaChmdW5jdGlvbihyZWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlZ1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgbmIgPSBzY29wZS5wYXRocy5maWx0ZXIoZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgICAgdmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHNjb3BlLmRhdGFbaWRdO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbXCJyZWdpb25cIl0gPT0gcmVnO1xuICAgICAgICAgICAgICAgIH0pLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIHZhciBuYkFjdGlmID0gem9uZXNEZWphLmZpbHRlcihmdW5jdGlvbih6b25lKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gem9uZVtcInJlZ2lvblwiXSA9PSByZWc7XG4gICAgICAgICAgICAgICAgfSkubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocmVnKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuYik7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cobmJBY3RpZik7XG5cbiAgICAgICAgICAgICAgICBpZiAobmIgPT0gbmJBY3RpZiAmJiBuYiA+IDAgJiYgbmJBY3RpZiA+IDApXG4gICAgICAgICAgICAgICAgICBzY29wZS5jdHJsUmVnaW9uQWN0aWYocmVnKTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgc2NvcGUuem9uZXNEYXRhID0gYW5ndWxhci5jb3B5KHpvbmVzRGVqYSk7XG4gICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuXG4gICAgICAgIHNjb3BlLnJlbmRlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICAgIGlmIChtYXAgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgICAgdmFyIGcgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXBcIik7XG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkMy54bWwobWFwKVxuICAgICAgICAgICAgICAubWltZVR5cGUoXCJpbWFnZS9zdmcreG1sXCIpXG4gICAgICAgICAgICAgIC5nZXQoZnVuY3Rpb24oZXJyb3IsIGRvYykge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikgY29uc29sZS53YXJuKGVycm9yKTtcblxuICAgICAgICAgICAgICAgIHZhciBlbHRzID0gQXJyYXkuZnJvbShkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXRoXCIpKTtcbiAgICAgICAgICAgICAgICBlbHRzID0gZWx0cy5maWx0ZXIoZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHAuZ2V0QXR0cmlidXRlKFwiaWRcIikuc3Vic3RyKDAsIDQpICE9IFwicGF0aFwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBwYXRoQ29vcmRzID0gbmV3IEFycmF5KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBDcsOpYXRpb24gZGVzIGVsZW1lbnRzIC8gUGF0aHNcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBkID0gZWx0c1tpXS5nZXRBdHRyaWJ1dGUoXCJkXCIpLFxuICAgICAgICAgICAgICAgICAgICBpZCA9IGVsdHNbaV0uZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IGdcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkXCIsIGQpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidG9wXCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgaWQpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwYXRoUmVnaW9uXCIpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFzY29wZS5kYXRhW2lkXSkgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICB2YXIgcmVnaW9uID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgICBzY29wZS5wYXRocy5wdXNoKHBhdGgpO1xuICAgICAgICAgICAgICAgICAgLy8gY2hvaXggZGVzIHpvbmVzXG5cbiAgICAgICAgICAgICAgICAgIGlmIChzY29wZS5yZWdpb25zLmxlbmd0aCA+IDAgJiYgcmVnaW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucGF0aHMuZm9yRWFjaChmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBzY29wZS5kYXRhW2lkXTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnJlZ2lvbnMuaW5kZXhPZihcIm5hdGlvbmFsXCIpICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSkgPT09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS56b25lc0RhdGEucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUucmVnaW9ucy5pbmRleE9mKGRhdGFbXCJyZWdpb25cIl0pICE9PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuem9uZXNEYXRhLmluZGV4T2YoZGF0YSkgPT09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS56b25lc0RhdGEucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBWYWxpZGUgbGEgc8OpbGVjdGlvbiAvIHpvbmVzXG5cbiAgICAgICAgICAgICAgICAgIC8vIGlmKHNjb3BlLnpvbmVzRGF0YS5sZW5ndGggPiAwICYmIHJlZ2lvbiAhPT0gdW5kZWZpbmVkKXtcblxuICAgICAgICAgICAgICAgICAgLy8gXHRpZihzY29wZS56b25lc0RhdGEuaW5kZXhPZihyZWdpb24pICE9PSAtMSl7XG4gICAgICAgICAgICAgICAgICAvLyBcdFx0cGF0aC5hdHRyKFwiY2xhc3NcIixcInBhdGhBY3RpdmVcIik7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRpZihyZWdpb25bJ3JlZ2lvbiddPT1cIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRcdHBhdGguYXR0cihcImZpbGxcIiwgY29sb3JDZW50cmUpO1xuICAgICAgICAgICAgICAgICAgLy8gXHRcdGVsc2UgaWYocmVnaW9uWydyZWdpb24nXT09XCJFc3QgLyBvc3RlblwiKVxuICAgICAgICAgICAgICAgICAgLy8gXHRcdFx0cGF0aC5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgICAvLyBcdFx0ZWxzZSBpZihyZWdpb25bJ3JlZ2lvbiddPT1cIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgICAvLyBcdFx0XHRwYXRoLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgIC8vIFx0XHRlbHNlIGlmKHJlZ2lvblsncmVnaW9uJ109PVwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgLy8gXHRcdFx0cGF0aC5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuICAgICAgICAgICAgICAgICAgLy8gXHR9XG4gICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICB2YXIgYm94ID0gcGF0aC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgICAgICAgICAgICAgICAgcGF0aENvb3Jkcy5wdXNoKGJveCk7XG4gICAgICAgICAgICAgICAgICB2YXIgY2VudGVyID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiBib3hbXCJ4XCJdICsgYm94W1wid2lkdGhcIl0gLyAyLFxuICAgICAgICAgICAgICAgICAgICB5OiBib3hbXCJ5XCJdICsgYm94W1wiaGVpZ2h0XCJdIC8gMlxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImN4XCIsIGNlbnRlcltcInhcIl0pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgY2VudGVyW1wieVwiXSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIFwiNHB4XCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwidG9wXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlY2hlcmNoZSBkZSByw6lnaW9ucyBFbnRpZXJlbWVudCBBY3RpdmVzXG5cbiAgICAgICAgICAgICAgICB2YXIgcmVnaW9ucyA9IG5ldyBBcnJheShcbiAgICAgICAgICAgICAgICAgIFwiQ2VudHJlIC8gemVudHJ1bVwiLFxuICAgICAgICAgICAgICAgICAgXCJFc3QgLyBvc3RlblwiLFxuICAgICAgICAgICAgICAgICAgXCJTdWQgLyBzdWRlblwiLFxuICAgICAgICAgICAgICAgICAgXCJOb3JkIC8gbm9yZGVuXCJcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgcmVnaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJlZykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5iID0gc2NvcGUucGF0aHMuZmlsdGVyKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gcGF0aC5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YSkgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW1wicmVnaW9uXCJdID09IHJlZztcbiAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIHZhciBuYkFjdGlmID0gc2NvcGUuem9uZXNEYXRhLmZpbHRlcihmdW5jdGlvbih6b25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lW1wicmVnaW9uXCJdID09IHJlZztcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgaWYgKG5iID09IG5iQWN0aWYpIHNjb3BlLmN0cmxSZWdpb25BY3RpZihyZWcpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gVHJhbnNsYXRpb24gZHUgU1ZHIGF1IG1pbiBkZXMgYXhlcyAtMC41ICVcblxuICAgICAgICAgICAgICAgIHZhciBtaW5ZID0gZDMubWluKFxuICAgICAgICAgICAgICAgICAgcGF0aENvb3Jkcy5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcFtcInlcIl07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWluWCA9IGQzLm1pbihcbiAgICAgICAgICAgICAgICAgIHBhdGhDb29yZHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBbXCJ4XCJdO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgZy5hdHRyKFxuICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgICAgICAgIFwidHJhbnNsYXRlKFwiICtcbiAgICAgICAgICAgICAgICAgICAgbWluWCAqIC0wLjkgK1xuICAgICAgICAgICAgICAgICAgICBcIiwtXCIgK1xuICAgICAgICAgICAgICAgICAgICBtaW5ZICogMC4xICtcbiAgICAgICAgICAgICAgICAgICAgXCIpIHNjYWxlKDAuOTUsMSlcIlxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBQb3NpdGlvbm5lbWVudCBkdSBjYWRyZSDDoCArMjAgJVxuXG4gICAgICAgICAgICAgICAgdmFyIG1heFkgPSBkMy5tYXgoXG4gICAgICAgICAgICAgICAgICBwYXRoQ29vcmRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwW1wieVwiXSArIHBbXCJoZWlnaHRcIl07XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF4WCA9IGQzLm1heChcbiAgICAgICAgICAgICAgICAgIHBhdGhDb29yZHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBbXCJ4XCJdICsgcFtcIndpZHRoXCJdO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIG1heFggKiAwLjgpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgbWF4WSAvIDUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1heFggKiAwLjQpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBtYXhZICogMC4yKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJncmV5XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInJ4XCIsIFwiOFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeVwiLCBcIjhcIilcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpO1xuXG4gICAgICAgICAgICAgICAgLy8gTGlnbmUgbGlhbnQgbGUgY2FkcmUgJiBsZSBwYXRoXG5cbiAgICAgICAgICAgICAgICB2YXIgbGluZSA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIGNlbnRlcltcInhcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIGNlbnRlcltcInlcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIHJlY3QuYXR0cihcInhcIikpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcbiAgICAgICAgICAgICAgICAgICAgXCJ5MlwiLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZWN0LmF0dHIoXCJ5XCIpKSArIHBhcnNlSW50KHJlY3QuYXR0cihcImhlaWdodFwiKSAvIDIpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInN0cm9rZS13aWR0aFwiLCAzKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJncmV5XCIpO1xuICAgICAgICAgICAgICAgIC8vIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwic2NhbGUoXCIgKyAoMSAtIGQgLyAyNSkgKiAyMCArIFwiKVwiOyB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gYW5ndWxhci5jb3B5KHJlZ2lvbik7XG4gICAgICAgICAgICAgICAgLy8gR2VzdGlvbiBkdSB0ZXh0ZSBkYW5zIGxlIGNhZHJlXG4gICAgICAgICAgICAgICAgdmFyIHggPSBwYXJzZUludChyZWN0LmF0dHIoXCJ4XCIpKSxcbiAgICAgICAgICAgICAgICAgIHkgPSBwYXJzZUludChyZWN0LmF0dHIoXCJ5XCIpKSxcbiAgICAgICAgICAgICAgICAgIHcgPSBwYXJzZUludChyZWN0LmF0dHIoXCJ3aWR0aFwiKSksXG4gICAgICAgICAgICAgICAgICBoID0gcGFyc2VJbnQocmVjdC5hdHRyKFwiaGVpZ2h0XCIpKTtcbiAgICAgICAgICAgICAgICB2YXIgdmlsbGUgPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHggKyAxNSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgMzUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJWaWxsZVwiXSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcImJsYWNrXCIpO1xuICAgICAgICAgICAgICAgIHZhciByZWdpb24gPSBnXG4gICAgICAgICAgICAgICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHggKyAxNSlcbiAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgNjUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjIwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJyZWdpb25cIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgYnJ1dCA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgeCArIDE1KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyAxMDUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJicnV0XCJdKVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiYmxhY2tcIik7XG4gICAgICAgICAgICAgICAgdmFyIG5ldCA9IGdcbiAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgeCArIDE1KVxuICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyAxMzUpXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjMwcHhcIilcbiAgICAgICAgICAgICAgICAgIC50ZXh0KGRhdGFbXCJuZXRcIl0pXG4gICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKTtcblxuICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcblxuICAgICAgICAgICAgICAgIC8vIEFzc29jaWF0aW9uIGRlcyBkYXRhc1xuXG4gICAgICAgICAgICAgICAgLy8gR2VzdGlvbiBkZSBsYSBzb3VyaXNcblxuICAgICAgICAgICAgICAgIGcuc2VsZWN0QWxsKFwicGF0aFwiKVxuICAgICAgICAgICAgICAgICAgLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIFwib3JhbmdlXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2lyY2xlID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdChcImNpcmNsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgbGluZVxuICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgY2lyY2xlLmF0dHIoXCJjeFwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIGNpcmNsZS5hdHRyKFwiY3lcIikpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBkMy5zZWxlY3QodGhpcykuYXR0cihcImlkXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHh0ID0gXCJcIjtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoc2NvcGUuZGF0YSkuaW5kZXhPZihpZCkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSBzY29wZS5kYXRhW2lkXTtcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdmlsbGVOYW1lID0gZFtcIlZpbGxlXCJdLnJlcGxhY2UoXCJfXCIsIFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICB2aWxsZU5hbWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdmlsbGVOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB2aWxsZU5hbWUuc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgICAgLy8gdmlsbGVOYW1lID0gcmVnaW9uLnRleHQoZFtcInJlZ2lvblwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gdmlsbGVOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyB2aWxsZU5hbWUuc3Vic3RyKDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmlsbGUudGV4dCh2aWxsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGJydXQudGV4dChcIkJydXQgOiBcIiArIGRbXCJicnV0XCJdKTtcbiAgICAgICAgICAgICAgICAgICAgICBuZXQudGV4dChcIk5ldCA6IFwiICsgZFtcIm5ldFwiXSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGRbXCJyZWdpb25cIl0gPT0gXCJDZW50cmUgLyB6ZW50cnVtXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JDZW50cmUpO1xuICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRbXCJyZWdpb25cIl0gPT0gXCJFc3QgLyBvc3RlblwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yRXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkW1wicmVnaW9uXCJdID09IFwiU3VkIC8gc3VkZW5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvclN1ZCk7XG4gICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIk5vcmQgLyBub3JkZW5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvck5vcmQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ291bGV1ciBkdSB0ZXh0ZSBSw6lnaW9uXG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIkNlbnRyZSAvIHplbnRydW1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbi5hdHRyKFwiZmlsbFwiLCBjb2xvckNlbnRyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZFtcInJlZ2lvblwiXSA9PSBcIkVzdCAvIG9zdGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb24uYXR0cihcImZpbGxcIiwgY29sb3JFc3QpO1xuICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRbXCJyZWdpb25cIl0gPT0gXCJTdWQgLyBzdWRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yU3VkKTtcbiAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkW1wicmVnaW9uXCJdID09IFwiTm9yZCAvIG5vcmRlblwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uLmF0dHIoXCJmaWxsXCIsIGNvbG9yTm9yZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmlsbGUudGV4dChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgcmVnaW9uLnRleHQoXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgYnJ1dC50ZXh0KFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgIG5ldC50ZXh0KFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJjbGFzc1wiKSAhPSBcInBhdGhBY3RpdmVcIilcbiAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAub24oXCJjbGlja1wiLCBmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2NvcGUuZGF0YVtpZF07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiY2xhc3NcIikgPT0gXCJwYXRoQWN0aXZlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICBzY29wZS5jdHJsUmVtb3ZlKGRhdGEsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhSZWdpb25cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmN0cmxBam91dChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImNsYXNzXCIsIFwicGF0aEFjdGl2ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiQ2VudHJlIC8gemVudHJ1bVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJmaWxsXCIsIGNvbG9yQ2VudHJlKTtcbiAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhW1wicmVnaW9uXCJdID09IFwiRXN0IC8gb3N0ZW5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZmlsbFwiLCBjb2xvckVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0YVtcInJlZ2lvblwiXSA9PSBcIlN1ZCAvIHN1ZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JTdWQpO1xuICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGFbXCJyZWdpb25cIl0gPT0gXCJOb3JkIC8gbm9yZGVuXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cihcImZpbGxcIiwgY29sb3JOb3JkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNjb3BlLmxvYWRGaWxlID0gZnVuY3Rpb24oZmlsZSkge1xuICAgICAgICAgIGQzLmNzdihmaWxlLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBzY29wZS5kYXRhID0ge307XG4gICAgICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICBzY29wZS5kYXRhW2RbXCJWaWxsZVwiXV0gPSBkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdjbGllbnQuc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJjbGllbnRTZXJ2aWNlXCIsIFsnJHEnLCAnJGh0dHAnLCBmdW5jdGlvbigkcSwgJGh0dHApe1xuXG5cdFx0cmV0dXJue1xuXHRcdFx0Z2V0OmZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL2NsaWVudC9nZXRcIiwge2lkOmlkfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblxuXHRcdFx0Z2V0QWxsOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9jbGllbnQvZ2V0QWxsXCIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldE1lOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2NsaWVudC9nZXRNZVwiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0YWRkOmZ1bmN0aW9uKGNvb3Jkb25uZWUpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucHV0KFwiL2FwaS9jbGllbnQvXCIsIHtjb29yZG9ubmVlOmNvb3Jkb25uZWV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0bW9kaWY6ZnVuY3Rpb24oY2xpZW50SWQsIGNvb3Jkb25uZWUpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucGF0Y2goXCIvYXBpL2NsaWVudC9cIiwge2NsaWVudElkOmNsaWVudElkLCBjb29yZG9ubmVlOmNvb3Jkb25uZWV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRjaGFuZ2VMYW5nOmZ1bmN0aW9uKGxhbmcpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucGF0Y2goXCIvYXBpL2NsaWVudC9sYW5nXCIsIHtsYW5nOmxhbmd9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRsb2FkTGFuZzpmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9jbGllbnQvbGFuZ1wiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnY29tbWFuZGUuc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJjb21tYW5kZVNlcnZpY2VcIiwgWyckcScsICckaHR0cCcsIGZ1bmN0aW9uKCRxLCAkaHR0cCl7XG5cblx0XHRyZXR1cm57XG5cdFx0XHRnZXQ6ZnVuY3Rpb24oaWQpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvY29tbWFuZGUvZ2V0XCIsIHtpZDppZH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldE1lOmZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2NvbW1hbmRlL2dldE1lXCIpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKGNvbW1hbmRlSWQsIGNvbW1hbmRlKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBhdGNoKFwiL2FwaS9jb21tYW5kZS9cIiwge2NvbW1hbmRlSWQ6Y29tbWFuZGVJZCwgY29tbWFuZGU6Y29tbWFuZGV9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0Y2xlYXI6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvY29tbWFuZGUvY2xlYXJcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblxuXHRcdFx0ZW1haWw6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvY29tbWFuZGUvZW1haWxcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cdH1dKTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwYWllbWVudC5zZXJ2aWNlcycsIFtdKVxuXHQuc2VydmljZShcInBhaWVtZW50U2VydmljZVwiLCBbJyRxJywgJyRodHRwJywgZnVuY3Rpb24oJHEsICRodHRwKXtcblxuXHRcdHJldHVybntcblx0XHRcdGdldDpmdW5jdGlvbihpZCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9wYWllbWVudFwiLCB7aWQ6aWR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0YWRkOmZ1bmN0aW9uKHBhaWVtZW50KXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnB1dChcIi9hcGkvcGFpZW1lbnRcIiwge3BhaWVtZW50OnBhaWVtZW50fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKHBhaWVtZW50KXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBhdGNoKFwiL2FwaS9wYWllbWVudFwiLCB7cGFpZW1lbnQ6cGFpZW1lbnR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXHRcdFx0c2F2ZUNhcmQ6ZnVuY3Rpb24oY2FyZCl7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3BhaWVtZW50L2NhcmRcIiwge2NhcmQ6Y2FyZH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGdldENhcmQ6ZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3BhaWVtZW50L2NhcmRcIikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHR9XG5cdH1dKTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdwcm9tb3Rpb24uc2VydmljZXMnLCBbXSlcblx0LnNlcnZpY2UoXCJwcm9tb3Rpb25TZXJ2aWNlXCIsIFsnJHEnLCAnJGh0dHAnLCBmdW5jdGlvbigkcSwgJGh0dHApe1xuXG5cdFx0cmV0dXJue1xuXHRcdFx0Z2V0OmZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3Byb21vdGlvbi9nZXRcIiwge2lkOmlkfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0cmV0dXJuICRxLndoZW4ocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uKGVycil7XG5cdFx0XHRcdFx0aWYoZXJyLnN0YXR1cz09NDA0KVxuXHRcdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChcIm5vbiB0cm91dsOpXCIpO1xuXHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoZXJyKTtcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cblx0XHRcdGdldEFsbDpmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvcHJvbW90aW9uL2dldEFsbFwiKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblxuXG5cdFx0XHRhZGQ6ZnVuY3Rpb24ocHJvbW90aW9uKXtcblx0XHRcdFx0cmV0dXJuICRodHRwLnB1dChcIi9hcGkvcHJvbW90aW9uL1wiLCB7cHJvbW90aW9uOnByb21vdGlvbn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdG1vZGlmOmZ1bmN0aW9uKHByb21vdGlvbil7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5wYXRjaChcIi9hcGkvcHJvbW90aW9uL1wiLCB7cHJvbW90aW9uOnByb21vdGlvbn0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRcdHJldHVybiAkcS53aGVuKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHR9LCBmdW5jdGlvbihlcnIpe1xuXHRcdFx0XHRcdGlmKGVyci5zdGF0dXM9PTQwNClcblx0XHRcdFx0XHRcdHJldHVybiAkcS5yZWplY3QoXCJub24gdHJvdXbDqVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KGVycik7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXG5cblx0XHRcdGRlbGV0ZTpmdW5jdGlvbihwcm9tb3Rpb24pe1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKFwiL2FwaS9wcm9tb3Rpb24vP3Byb21JZD1cIitwcm9tb3Rpb24uX2lkKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdFx0XHRyZXR1cm4gJHEud2hlbihyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSwgZnVuY3Rpb24oZXJyKXtcblx0XHRcdFx0XHRpZihlcnIuc3RhdHVzPT00MDQpXG5cdFx0XHRcdFx0XHRyZXR1cm4gJHEucmVqZWN0KFwibm9uIHRyb3V2w6lcIik7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlamVjdChlcnIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblx0XHR9XG5cdH1dKTsiXX0=
