var v = window.version;
require.config({
    baseUrl: '',
    waitSeconds: 30,
    urlArgs: v,
    paths: {
        'text': 'lib/require/text',
        'bootstrap': 'assets/lib/bootstrap/js/bootstrap',
        'toastr': 'assets/lib/toastr/toastr',
        'jQuery': 'lib/jquery/jquery-2.1.3',
        'angular': 'lib/angular/angular',
        'angularLocalStorage': 'lib/angular/angular-local-storage',
        'angularRoute': 'lib/angular/angular-route',
        'angularUIRoute': 'lib/angular/angular-ui-router',
        'angularResource': 'lib/angular/angular-resource',
        'angularCookies': 'lib/angular/angular-cookies',
        'angularSanitize': 'lib/angular/angular-sanitize',
        'moment': 'lib/moment/moment-with-locales',
        'config': 'app/main/config',
        'mainCtrl': 'app/main/controllers/mainCtrl',
        'routeResolver': 'app/main/services/routeResolverSvc',
        'linq': 'lib/linq/jquery.linq'
    },
    shim: {
        'jQuery': {
            exports: 'jQuery'
        },
        'linq': {
            deps: ['jQuery']
        },
        'toastr': {
            deps: ['jQuery']
        },
        'bootstrap': {
            deps: ['jQuery'],
        },
        'constant': {
            deps: ['jQuery'],
        },
        'angular': {
            deps: ['jQuery'],
            exports: 'angular'
        },
        'angularRoute': {
            deps: ['angular'],
        },
        'angularUIRoute': {
            deps: ['angularRoute'],
        },
        'angularResource': {
            deps: ['angular', 'angularRoute']
        },
        'angularLocalStorage': {
            deps: ['angular']
        },
        'angularCookies': {
            deps: ['angular'],
            exports: 'angularCookies'
        },
        'angularSanitize': {
            deps: ['angular'],
            exports: 'angularSanitize'
        },
        'moment': {
            deps: ['jQuery'],
            exports: 'moment'
        },
        'routeResolver': {
            deps: ['angular'],
        },
        'mainCtrl': {
            deps: ['routeResolver', 'app/app', 'app/routes', 'angularSanitize', 'angularCookies',  'angularLocalStorage', 'angularUIRoute']
        },
        'app/app': {
            deps: ['angular']
        },
        'app/routes': {
            deps: ['app/app', 'angularRoute', 'angularResource']
        },
    }
});

require([
 'bootstrap', 'toastr', 'moment', 'mainCtrl', 'text', 'linq'
], function () {
    'use strict';
      angular.bootstrap(document, ['app']);

});
