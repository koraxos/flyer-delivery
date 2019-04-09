"use strict";

angular.module("commande.services", []).service("commandeService", [
  "$q",
  "$http",
  function($q, $http) {
    return {
      get: function(id) {
        debugger;
        return $http.post("/api/commande/get", { id: id }).then(
          function(response) {
            return $q.when(response.data);
          },
          function(err) {
            if (err.status == 404) return $q.reject("non trouvé");
            return $q.reject(err);
          }
        );
      },
      sendMail: function(data) {
        return $http.post("/api/commande/sendMail", { data: data }).then(
          function(response) {
            console.log("RESPONSE", response);
            return $q.when(response.data);
          },
          function(err) {
            console.log("ERROR", err);
            if (err.status == 404) return $q.reject("non trouvé");
            return $q.reject(err);
          }
        );
      },

      getMe: function() {
        debugger;
        return $http.get("/api/commande/getMe").then(
          function(response) {
            debugger;
            return $q.when(response.data);
          },
          function(err) {
            if (err.status == 404) return $q.reject("non trouvé");
            return $q.reject(err);
          }
        );
      },

      modif: function(commandeId, commande) {
        return $http
          .patch("/api/commande/", {
            commandeId: commandeId,
            commande: commande
          })
          .then(
            function(response) {
              return $q.when(response.data);
            },
            function(err) {
              if (err.status == 404) return $q.reject("non trouvé");
              return $q.reject(err);
            }
          );
      },

      clear: function() {
        return $http.get("/api/commande/clear").then(
          function(response) {
            return $q.when(response.data);
          },
          function(err) {
            if (err.status == 404) return $q.reject("non trouvé");
            return $q.reject(err);
          }
        );
      },

      email: function() {
        return $http.get("/api/commande/email").then(
          function(response) {
            return $q.when(response.data);
          },
          function(err) {
            if (err.status == 404) return $q.reject("non trouvé");
            return $q.reject(err);
          }
        );
      }
    };
  }
]);
