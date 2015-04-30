define([
    'text!app/main/directives/spinner/spinner.html',
    'app/main/directives/spinner/spinnerSvc'
], function(template) {
    "use strict";

    angular.module('app').directive('spinner', ['spinnerSvc',
        function(spinnerSvc) {
            return {
                restrict: 'EAC',
                replace: true,
                template: template,
                scope: {
                    ctrl: '=',
                    fullscreen: '='
                },

                link: function(scope, element) {
                    element.hide();
                    element.fadeIn();
                    scope.spinner = spinnerSvc.getSpinner();

                    scope.init = function(isReload) {

                        scope.process = spinnerSvc.getProcess(scope.ctrl);

                        if (scope.ctrl != 'loading' && isReload) {
                            scope.process.isShow = true;
                        }
                        element.parent().css({
                            position: 'relative'
                        });


                        setTimeout(function() {
                            if (scope.spinner.isFull || scope.fullscreen) {
                                element.css({
                                    width: $(window).innerWidth(),
                                    height: $(window).innerHeight(),
                                    position: 'fixed',
                                    background: "url('assets/images/dot-pixel.png')",
                                    top: 0,
                                    left: 0,
                                    zIndex: 9999
                                });
                            } else {

                                element.css({
                                    width: element.parent().innerWidth(),
                                    height: element.parent().innerHeight(),
                                    background: '#fff',
                                    position: 'absolute',
                                    top: 0,
                                    zIndex: 1040
                                });
                            }
                            element.show();
                            $('#preload').remove();
                        });
                        if (scope.ctrl === 'loading') {
                            setTimeout(function() {
                                scope.process.isShow = false;
                            }, 30000);
                        }


                    };

                    scope.$watch('spinner.count', function(newValue, oldValue) {
                        if (newValue && newValue !== oldValue) {
                            scope.init(true);
                        }
                    });
                    scope.$on("$destroy", function() {
                        //shareSvc.freeScope(scope);
                    });
                    setTimeout(function() {
                        scope.init();
                    }, 500);
                }
            };
        }
    ]);
});
