define([
        'app/main/directives/spinner/spinner'
], function () {
    "use strict";
    angular.module('app').controller('MainCtrl', ['$scope', 'spinnerSvc', function ($scope, spinnerSvc) {
        spinnerSvc.getProcess('loading', true);
    }]);
});
