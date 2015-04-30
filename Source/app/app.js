define([
], function () {
    'use strict';

    var app = angular.module('app', ['routeResolver','ngRoute', 'ngResource', 'ngSanitize', 'ngCookies','ui.router']);
    return app;
});
