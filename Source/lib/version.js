(function () {
    var now = new Date();
    var timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
    window.version = timestamp.getTime() / 10000;
})();
window.version = 1;
