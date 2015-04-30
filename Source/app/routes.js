define([
    'app/app',
    'text!app/page/home/views/home.html'
], function(app) {
    'use strict';
    var args = arguments;
    app.config([
        'routeResolverSvcProvider',
        '$stateProvider',
        '$urlRouterProvider',
        function(routeResolverSvcProvider, $stateProvider, $urlRouterProvider) {
            routeResolverSvcProvider.routeConfig.setBaseDirectories('app/');
            $stateProvider
                .state('home', routeResolverSvcProvider.route.resolve("page/home/controllers/home", args[1], "/home"));
            //TODO: if any problem happen with url, app will load default link below
            $urlRouterProvider.otherwise("/home");

        }
    ]);
});
