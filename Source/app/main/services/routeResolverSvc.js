define(function() {
    'use strict';

    angular.module('routeResolver', []).provider('routeResolverSvc', function() {
        var self = this;
        self.$get = function() {
            return self;
        };

        self.routeConfig = function() {
            var directory = 'app/',
                setBaseDirectories = function(viewsDir) {
                    directory = viewsDir;
                },
                getDirectory = function() {
                    return directory;
                };
            return {
                setBaseDirectories: setBaseDirectories,
                getDirectory: getDirectory
            };
        }();
        self.resolveController = function(path, controller) {
            return {
                controller: ['$q', '$rootScope',
                    function($q, $rootScope) {
                        var defer = $q.defer();
                        require(['app/' + path + controller + 'Ctrl'], function() {
                            defer.resolve();
                            $rootScope.$apply();

                        });
                        return defer.promise;
                    }
                ]
            };
        };
        self.route = function(routeConfig) {

            var resolve = function(baseName, template, url) {
                var routeDef = {};
                routeDef.template = template;
                routeDef.url = url;
                routeDef.resolve = {
                    load: ['$q',
                        function($q) {
                            var modulePath = [routeConfig.getDirectory() + baseName.substring(0, baseName.indexOf('/')) + "/index"];
                            var dependencies = [
                                routeConfig.getDirectory() + baseName + 'Ctrl'
                            ];
                            return resolveDependencies($q, dependencies, modulePath);
                        }
                    ]
                };

                return routeDef;
            },

                resolveDependencies = function($q, dependencies, modulePath) {
                    var defer = $q.defer();
                    if (window.PUBLISHED) {
                        require([modulePath + '.js'], function() {
                            require(dependencies, function() {
                                defer.resolve();
                            });
                        });
                    } else {
                        require(dependencies, function() {
                            defer.resolve();
                        });
                    }
                    return defer.promise;
                };

            return {
                resolve: resolve
            };
        }(self.routeConfig);
    });

});
