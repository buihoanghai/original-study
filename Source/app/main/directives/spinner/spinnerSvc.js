define([], function() {
    "use strict";
    angular.module('app').factory('spinnerSvc', [
        function() {
            var spinnerObj = {};
            var spinner = {
                isFull: true,
                count: 0
            };

            var revealed = {
                getProcess: getProcess,
                doneProcess: doneProcess,
                hideSpinner: hideSpinner,
                getSpinner: getSpinner,
                reloadSpinner: reloadSpinner,
                setFullSpinner: setFullSpinner,
                setModuleSpinner: setModuleSpinner,
                resetSpinner: resetSpinner
            };
            return revealed;


            function getProcess(ctrlId, isReload) {
                if (!spinnerObj[ctrlId]) {
                    spinnerObj[ctrlId] = {
                        isShow: true
                    };
                } else if (isReload) {
                    spinnerObj[ctrlId].isShow = true;
                }
                return spinnerObj[ctrlId];
            }

            function doneProcess(ctrlId) {
                if (spinnerObj[ctrlId]) {
                    spinnerObj[ctrlId].isShow = false;
                } else {
                    spinnerObj[ctrlId] = {
                        isShow: false
                    };
                }
            }

            function hideSpinner() {
                setTimeout(function() {
                    $('.spinner-wrapper').hide();
                });
            }

            function getSpinner() {
                return spinner;
            }

            function reloadSpinner() {
                spinner.count = +moment();
            }

            function setFullSpinner() {
                spinner.isFull = true;
            }

            function setModuleSpinner() {
                spinner.isFull = false;
            }

            function resetSpinner() {
                spinnerObj = {};
            }
        }
    ]);
});
