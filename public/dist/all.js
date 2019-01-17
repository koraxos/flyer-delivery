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
'use strict';

myApp.controller("accueilCtrl", ['$scope', '$rootScope','$timeout', 'clientService', 'commandeService', function($scope, $rootScope, $timeout, $clientService, $commandeService){
	
	$scope.zones = new Array();
	$scope.regions = new Array();
	$scope.sumNet = 0, $scope.sumBrut = 0, $scope.total = 0;
	$scope.commande = {};


	$clientService.getMe().then(function(rep){
		$timeout(function(){
			$scope.client = rep.client;
			$scope.commande = rep.commande;
			$scope.zones = rep.commande.zones.map(function(zone){
				var villeName = zone['Ville'].replace("_"," ");
				return {Ville:zone['Ville'], name:villeName[0].toUpperCase() + villeName.substr(1), region:zone['region'], brut:zone['brut'], net:zone['net']};	
			});
			var format = $scope.commande.format;
			if(format!="A4" && format!="A5" && format != "A6")
				$scope.formatAutre = format;
			$scope.calcSum();
			runDatepicker();
			$scope.$apply();
		}, 150);
	
	}, function(err){
		console.warn(err);
		toastr.error(err.statusText);
	});



	$scope.calcTotal = function(){
		// console.log("calc Total");
		// console.log($scope.commande.zones.length);
		$commandeService.modif($scope.commande._id, $scope.commande).then(function(cmd){
			$scope.commande.total = cmd.total;
			$scope.commande.totalHT = cmd.totalHT;
		}, function(err){
			console.warn(err);
			toastr.error(err.statusText);
		});
	}


	$scope.saveCommande = function(path){
		// console.log("save cmd");
		// console.log($scope.commande.zones.length);
		$commandeService.modif($scope.commande._id, $scope.commande).then(function(cmd){
			angular.copy(cmd, $scope.commande);
			$rootScope.go(path);
		}, function(err){
			console.warn(err);
			toastr.error(err.statusText);
		})
	}



	$scope.ajout = function(data){
		var villeName = data['Ville'].replace("_"," ");
		data['name'] = villeName[0].toUpperCase() + villeName.substr(1);
		$scope.zones.push(data);
		$scope.commande.zones = angular.copy($scope.zones);
		$scope.calcSum();
		$scope.$apply();
		return;
	}


	$scope.ajoutMulti = function(data, apply){
		if(apply == undefined)
			apply = false;


		data.forEach(function(d){
			var villeName = d['Ville'].replace("_"," ");
			d['name'] = villeName[0].toUpperCase() + villeName.substr(1);

			var idx = $scope.zones.map(function(zon){
				return zon['Ville'];
			}).indexOf(d['Ville']);

			if(idx === -1)
				$scope.zones.push(d);
		});
		$scope.commande.zones = angular.copy($scope.zones);
		$scope.calcSum();
		return;
	};




	$scope.remove = function(data, apply){
		if(apply == undefined)
			apply = false;
		var idx = $scope.zones.map(function(zon){
			return zon['Ville'];
		}).indexOf(data['Ville']);
		if(idx !== -1)
			$scope.zones.splice(idx, 1);
		$scope.commande.zones = angular.copy($scope.zones);
		$scope.calcSum();
		if(apply)
			$scope.$apply();
		return;
	}


	$scope.removeMulti = function(data, apply){
		if(apply == undefined)
			apply = false;

		data.forEach(function(d){
			var idx = $scope.zones.map(function(zon){
				return zon['Ville'];
			}).indexOf(d['Ville']);
			if(idx !== -1)
				$scope.zones.splice(idx, 1);
		});
		$scope.commande.zones = angular.copy($scope.zones);
		$scope.calcSum();
		if(apply)
			$scope.$apply();
		return;
	}

	$scope.calcSum = function(){
		
		if($scope.zones.length == 0){
			$scope.sumBrut = 0;
			$scope.sumNet = 0;
			$scope.calcTotal();
			return;
		}

		$scope.sumBrut = $scope.zones.map(function(c){return parseFloat(c['brut']);}).reduce(function(a,b){return a+b;});
		$scope.sumNet = $scope.zones.map(function(c){return parseFloat(c['net']);}).reduce(function(a,b){return a+b;});

		$timeout(function(){
			$("#listVille").scrollTop($("#listVille > table").height());
			// $scope.apply();
		},10);
		
		$scope.calcTotal();
		$scope.changeMap();
		return;
	}



	$scope.changeMap = function(e){
		$scope.regions = new Array();
		if($scope.national){
			$scope.nord = true;
			$scope.est = true;
			$scope.sud = true;
			$scope.centre = true;
		}else if(e && e.target.id=="national"){
			$scope.nord = false;
			$scope.est = false;
			$scope.sud = false;
			$scope.centre = false;
		}


		if($scope.nord)
			$scope.regions.push("Nord / norden");
		if($scope.est)
			$scope.regions.push("Est / osten");
		if($scope.sud)
			$scope.regions.push("Sud / suden");
		if($scope.centre)
			$scope.regions.push("Centre / zentrum");
		
		return;
	}


	$scope.addRegion = function(name, apply){
		if(apply == undefined)
			apply = false;


		if(name == "Nord / norden")
			$scope.nord=true;
		if(name == "Est / osten")
			$scope.est=true;
		if(name == "Sud / suden")
			$scope.sud=true;
		if(name == "Centre / zentrum")
			$scope.centre=true;

		if($scope.nord && $scope.est && $scope.centre && $scope.sud)
			$scope.national=true;
		else
			$scope.national=false;

		$scope.changeMap(false);
		if(apply)
			$scope.$apply();
		
	}

}]);



















myApp.controller("commandeCtrl", ['$scope', '$rootScope', 'clientService', 'commandeService', function($scope, $rootScope, $clientService, $commandeService){

	$scope.client = {};
	$scope.commande = {};
	$scope.zones = [];
	$scope.path="";


	$clientService.getMe().then(function(rep){
		$scope.client = rep.client;
		$scope.commande = rep.commande;
		$scope.zones = angular.copy(rep.commande.zones);
	}, function(err){
		console.warn(err);
	});


	$scope.saveClient = function(path){
		if(!path || path === undefined) path=$scope.path;
		$clientService.modif($scope.client._id, $scope.client).then(function(client){
			angular.copy(client, $scope.client);
			$rootScope.go(path);
		});
	}


}]);






















myApp.controller("paiementCtrl", ['$scope', '$location', '$rootScope', 'clientService', 'commandeService', 'paiementService', function($scope, $location, $rootScope, $clientService, $commandeService, $paiementService){

	$scope.client = {
		entreprise:"",
		adresse:"",
		ville:"",
		pays:"",
		activité:"",
		telephone:"",
		tva:""
	};

	$scope.commande = {
		intitule:"",
		poid:"",
		format:"",
		contenu:"",
		semaine:"",
		total:0
	};


	var hostName = $location.protocol()+"://"+$location.host()+":"+$location.port()+"/";

	$scope.paiement = {
		montant:0,
		percent:$scope.frais,
		cardRegistration:{
			AccessKey:"",
			CardRegistrationURL:hostName,
			CardType:"",
			PreregistrationData:"",
			returnURL:hostName+"reglement"
		},
		crypto:"",
		date:{mois:1, year:2018}
	};


	$scope.enCours = false;


	$clientService.getMe().then(function(rep){
		$scope.client = rep.client;
		$scope.commande = rep.commande;
		angular.copy(rep.commande.zones, $scope.zones);
		angular.copy(rep.commande.total, $scope.paiement.montant);
	}, function(err){
		console.warn(err);
	});


	$scope.saveCard = function(card){
		return $paiementService.saveCard(card).then(function(rep){
			return true;
		}, function(err){
			console.warn(err);
			toastr.error(err.statusText);
			return false;
		})
	}



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


	$scope.mois = _.range(1,13).map(function(n){
		var d = new Date();
		d.setMonth(n);
		return n==12 ? "12" : n<10 ? "0"+d.getMonth() : d.getMonth();
	});

	$scope.years = _.range(15).map(function(n){
		var d = new Date();
		d.setYear(d.getFullYear()+n);
		return d.getFullYear();
	});


	$scope.typeCard = function(e){
		var val = $scope.paiement.carte;
		var newval = '';
		val = val.replace(/\s/g, '');
		for(var i=0; i < val.length; i++) {
			if(i%4 == 0 && i > 0) newval = newval.concat(' ');
			newval = newval.concat(val[i]);
		}
		$scope.paiement.carte = newval;
	}


}]);












myApp.controller("validationCtrl", ['$scope', '$rootScope', '$timeout', 'commandeService', function($scope, $rootScope, $timeout, $commandeService){

	var next = function(){
		$commandeService.clear()
		$timeout(function(){
			$rootScope.go('/');
		}, 2500);
	};

	$commandeService.email().then(function(rep){
		next();
	}, function(err){
		console.warn(err);
		toastr.error(err.statusText);
		next();
	});
	


}]);




myApp.controller("reglementCtrl", ['$scope', '$location', '$timeout', 'commandeService', function($scope, $location, $timeout, $commandeService){

	var next = function(){
		$commandeService.clear()
		$timeout(function(){
			$rootScope.go('/');
		}, 2500);
	};

	$commandeService.email().then(function(rep){
		next();
	}, function(err){
		console.warn(err);
		toastr.error(err.statusText);
		next();
	});


}]);



'use strict';

myApp.directive('d3Map', ['$timeout','$window', function($timeout, $window) {
	return {
		restrict: 'A',
		scope: {
			map: '@',
			cities: '@',
			regions: '=',
			zonesData: '=',
			width: '@',
			height: '@',
			ctrlAjout : '=',
			ctrlRemove : '=',
			ctrlAjoutMulti : '=',
			ctrlRemoveMulti : '=',
			ctrlRegionActif : '='
		},
		link: function(scope, ele, attrs) {


			// Valeurs par défault


			var margin = {top: 0, right:0 , bottom: 0, left: 0},
			width = d3.select(ele[0]).node().offsetWidth,
			width = scope.width===undefined ? width : scope.width,
			width = width - margin.left - margin.right,
			height = scope.height===undefined ? 2000 : scope.height,
			height = height - margin.top - margin.bottom,
			map = scope.map===undefined ? "Luxembourg.svg" : scope.map,
			cities = scope.cities===undefined ? "Commune.tsv" : scope.cities,
			regions = scope.regions===undefined ? new Array() : scope.regions;

			scope.data = null;
			scope.zonesData =  new Array();
			scope.paths = new Array();

			var colorCentre = "#5d2491", colorSud="#c01a2c", colorEst="#3871c2", colorNord = "#fbbd13";


			width = d3.select(ele[0]).node().offsetWidth;


			var svg = d3.select(ele[0]).append("svg").attr("width", width).attr("height", height);

			var formatNumber = d3.format(".1f");



			window.addEventListener("resize", function(){
				width = d3.select(ele[0]).node().offsetWidth;
				svg.attr("width", width);
				d3.select("g").remove();
				scope.render(scope.map);
			});




			scope.$watch('map', function(newData, oldValue) {
				scope.render(newData);
			}, true);






			scope.$watch('cities', function(newData, oldValue) {
				scope.loadFile(newData);
			}, true);


































			scope.$watch('regions', function(newData, oldValue) {
				var zoneRemoves = new Array();
				var zoneAjouts = new Array();
				scope.regions = angular.copy(newData);
				var zonesDeja = angular.copy(scope.zonesData);

				if(oldValue === undefined)
					oldValue = new Array();


				scope.paths.forEach(function(path){

					var id = path.attr("id");
					var data = scope.data[id];

					var idxZone = zonesDeja.map(function(z){return z['Ville'];}).indexOf(data['Ville']);

					if(scope.regions.indexOf('national') !== -1 && idxZone === -1){
						zonesDeja.push(data);
						zoneAjouts.push(data);
					}else if(scope.regions.indexOf(data['region']) !== -1 && idxZone === -1){
						zonesDeja.push(data);
						zoneAjouts.push(data);
					}else if(oldValue.indexOf(data['region']) !== -1 && scope.regions.indexOf(data['region']) === -1 && idxZone !== -1){
						zonesDeja.splice(idxZone, 1);
						zoneRemoves.push(data);
					};
				});


				scope.paths.forEach(function(p){
					var id = p.attr("id");
					var data = scope.data[id];

					if(zonesDeja.length > 0){

						// Zones sélectionner

						if(zonesDeja.map(function(z){return z['Ville'];}).indexOf(data['Ville']) !== -1){
							p.attr("class","pathActive");
							if(data['region']=="Centre / zentrum")
								p.attr("fill", colorCentre);
							else if(data['region']=="Est / osten")
								p.attr("fill", colorEst);
							else if(data['region']=="Sud / suden")
								p.attr("fill", colorSud);
							else if(data['region']=="Nord / norden")
								p.attr("fill", colorNord);
						}else{
							p.attr("fill", "white").attr("class","pathRegion");

						}
					}
				});

				// scope.zonesData = angular.copy(zonesDeja);

				// console.log('regionWatch');
				// console.log(zoneAjouts.length)
				// console.log(zoneRemoves.length)

				// ajouts ou suppression dans données

				if(zoneAjouts.length>0)
					scope.ctrlAjoutMulti(zoneAjouts);
				if(zoneRemoves.length>0)
					scope.ctrlRemoveMulti(zoneRemoves);


			}, true);































			scope.$watch('zonesData', function(newData, oldValue) {
				// console.log(oldValue);
				// console.log(newData);
				// console.log(scope.zonesDataData);

				$timeout(function(){

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
					scope.paths.forEach(function(p){
						var id = p.attr("id");
						var data = scope.data[id];
						if(zonesDeja.length > 0){
							if(zonesDeja.map(function(z){return z['Ville'];}).indexOf(data['Ville']) !== -1){

								p.attr("class","pathActive");
								if(data['region']=="Centre / zentrum")
									p.attr("fill", colorCentre);
								else if(data['region']=="Est / osten")
									p.attr("fill", colorEst);
								else if(data['region']=="Sud / suden")
									p.attr("fill", colorSud);
								else if(data['region']=="Nord / norden")
									p.attr("fill", colorNord);
							}else{
								p.attr("fill", "white").attr("class","pathRegion");
							}
						}else{
							p.attr("fill", "white").attr("class","pathRegion");
						}
					});



					// Recherche de régions Entierement Actives

					var regions = new Array("Centre / zentrum", "Est / osten", "Sud / suden", "Nord / norden");

					regions.forEach(function(reg){
						var nb = scope.paths.filter(function(path){
							var id = path.attr("id");
							var data = scope.data[id];
							return data['region'] == reg;
						}).length;

						var nbActif = zonesDeja.filter(function(zone){
							return zone['region'] == reg;
						}).length;

						// console.log(reg);
						// console.log(nb);
						// console.log(nbActif);

						if(nb == nbActif && nb>0 && nbActif>0)
							scope.ctrlRegionActif(reg);
					});


					scope.zonesData = angular.copy(zonesDeja);
				}, 200);




			}, true);














































			scope.render = function(map) {

				if(map === undefined) return;


				var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("class", "map");
				$timeout(function(){
					d3.xml(map).mimeType("image/svg+xml").get(function(error, doc){
						if(error) console.warn(error);

						var elts = Array.from(doc.getElementsByTagName("path"));
						elts = elts.filter(function(p){return p.getAttribute("id").substr(0, 4) != "path";})
						var pathCoords = new Array();

						// Création des elements / Paths
						for(var i=0;i<elts.length;i++){
							var d = elts[i].getAttribute("d"),
								id = elts[i].getAttribute("id");
							var path = g.append("path").attr("d", d).attr("fill","white").classed("top", false)
								.attr("stroke-width", 2).attr("stroke", "black").attr("id", id).attr("class","pathRegion");
							var region = scope.data[id];
							scope.paths.push(path);
							// choix des zones 

							if(scope.regions.length>0 && region !== undefined){
								scope.paths.forEach(function(path){

									var id = path.attr("id");
									var data = scope.data[id];

									if(scope.regions.indexOf('national') !== -1 && scope.zonesData.indexOf(data) === -1){
										scope.zonesData.push(data);
									}else if(scope.regions.indexOf(data['region']) !== -1 && scope.zonesData.indexOf(data) === -1){
										scope.zonesData.push(data);
									};
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
							var center = {'x':box['x']+box['width']/2, 'y':box['y']+box['height']/2,};
							path.append("circle").attr("cx",center['x']).attr("cy",center['y']).attr("r","4px")
								.attr("fill", "black")
								.classed("top", true);

						}


						// Recherche de régions Entierement Actives

						var regions = new Array("Centre / zentrum", "Est / osten", "Sud / suden", "Nord / norden");
						regions.forEach(function(reg){
							var nb = scope.paths.filter(function(path){
								var id = path.attr("id");
								var data = scope.data[id];
								return data['region'] == reg;
							}).length;
							var nbActif = scope.zonesData.filter(function(zone){
								return zone['region'] == reg;
							});
							if(nb == nbActif)
								scope.ctrlRegionActif(reg);
						});


						// Translation du SVG au min des axes -0.5 %

						var minY = d3.min(pathCoords.map(function(p){
							return p['y'];
						}));

						var minX = d3.min(pathCoords.map(function(p){
							return p['x'];
						}));

						g.attr("transform","translate("+minX*1.1+",-"+minY*0.1+") scale(0.95,1)");


						// Positionnement du cadre à +20 %

						var maxY = d3.max(pathCoords.map(function(p){
							return p['y']+p['height'];
						}));

						var maxX = d3.max(pathCoords.map(function(p){
							return p['x']+p['width'];
						}));


						var rect = g.append("rect").attr("x", maxX*0.8).attr("y", maxY/5)
							.attr("width", maxX*0.4).attr("height", maxY*0.2)
							.attr("stroke", "grey")
							.attr("fill", "none")
							.attr("rx", "8")
							.attr("ry", "8")
							.attr("stroke-width",3);


						// Ligne liant le cadre & le path

						var line = g.append("line").attr("x1", center['x']).attr("y1", center['y'])	
							.attr("x2", rect.attr('x')).attr("y2", parseInt(rect.attr('y'))+parseInt(rect.attr('height')/2))
							.attr("stroke-width",3).attr("stroke", "grey");
							// .attr("transform", function(d, i) { return "scale(" + (1 - d / 25) * 20 + ")"; });



						var data = angular.copy(region);
						// Gestion du texte dans le cadre
						var x = parseInt(rect.attr("x")), y=parseInt(rect.attr("y")),
							w = parseInt(rect.attr("width")), h = parseInt(rect.attr("height"));
						var ville = g.append("text").attr("x", x+15).attr("y", y+35)
							.attr("font-size", "30px")
							.text(data['Ville']).attr("fill", "black");
						var region = g.append("text").attr("x", x+15).attr("y", y+65)
							.attr("font-size", "20px")
							.text(data['region']).attr("fill", "black");
						var brut = g.append("text").attr("x", x+15).attr("y", y+105)
							.attr("font-size", "30px")
							.text(data['brut']).attr("fill", "black");
						var net = g.append("text").attr("x", x+15).attr("y", y+135)
							.attr("font-size", "30px")
							.text(data['net']).attr("fill", "black");

						if(data['region']=="Centre / zentrum")
							region.attr("fill", colorCentre);
						else if(data['region']=="Est / osten")
							region.attr("fill", colorEst);
						else if(data['region']=="Sud / suden")
							region.attr("fill", colorSud);
						else if(data['region']=="Nord / norden")
							region.attr("fill", colorNord);

							


						// Association des datas






						// Gestion de la souris

						g.selectAll("path")
							.on("mouseover", function(d, i){
								d3.select(this).attr("fill","orange");
								var circle = d3.select(this).select("circle");
								line.attr("x1", circle.attr("cx")).attr("y1", circle.attr("cy"));
								var id = d3.select(this).attr("id");
								var txt = "";

								if(Object.keys(scope.data).indexOf(id) !== -1){
									var d = scope.data[id];
									var villeName = d['Ville'].replace("_"," ");
									villeName = villeName[0].toUpperCase() + villeName.substr(1);

									ville.text(villeName);
									region.text(d['region']);
									brut.text("Brut : "+d['brut']);
									net.text("Net : "+d['net']);
									if(d['region']=="Centre / zentrum")
										d3.select(this).attr("fill", colorCentre);
									else if(d['region']=="Est / osten")
										d3.select(this).attr("fill", colorEst);
									else if(d['region']=="Sud / suden")
										d3.select(this).attr("fill", colorSud);
									else if(d['region']=="Nord / norden")
										d3.select(this).attr("fill", colorNord);

									// Couleur du texte Région

									if(d['region']=="Centre / zentrum")
										region.attr("fill", colorCentre);
									else if(d['region']=="Est / osten")
										region.attr("fill", colorEst);
									else if(d['region']=="Sud / suden")
										region.attr("fill", colorSud);
									else if(d['region']=="Nord / norden")
										region.attr("fill", colorNord);
								}else{
									ville.text(id);
									region.text("");
									brut.text("");
									net.text("");
								}
							})
							.on("mouseout", function(d, i){
								if(d3.select(this).attr("class") != "pathActive")
									d3.select(this).attr("fill","white");
							})
							.on("click", function(d, i){
								var id = d3.select(this).attr("id");
								var data = scope.data[id];


								if(d3.select(this).attr("class") == "pathActive"){
									scope.ctrlRemove(data, true);
									d3.select(this).attr("class", "pathRegion").attr("fill", "white");
								}else{
									scope.ctrlAjout(data);
									d3.select(this).attr("class", "pathActive");

									if(data['region']=="Centre / zentrum")
										d3.select(this).attr("fill", colorCentre);
									else if(data['region']=="Est / osten")
										d3.select(this).attr("fill", colorEst);
									else if(data['region']=="Sud / suden")
										d3.select(this).attr("fill", colorSud);
									else if(data['region']=="Nord / norden")
										d3.select(this).attr("fill", colorNord);
								}



							});

					});
				}, 0);


			};



			scope.loadFile = function(file){
				d3.csv(file, function(data){
					scope.data = {};
					data.forEach(function(d){
						scope.data[d['Ville']] = d;
					});
				});
			}
		}
	}
}]);
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