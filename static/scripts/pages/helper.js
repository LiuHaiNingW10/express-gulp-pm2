(function () {
    var util = require('./util');

    var fn = {
        subStr: function (str,start,end) {
            var a = '';
            a = str.substring(start,end) || '';
            return a
        }
    }
    module.exports = fn;
})();