/**
    tateti-ai.js
    Ta Te Ti computer player logic

    Depends on tateti.js

    Konrad Markus <konker@gmail.com>

 */

(function(exports){
    if (typeof(exports['tateti']) === 'undefined') {
        throw "tateti object dependency not found";
    }


    exports.tateti.ai = {
        init: function() {
        }
    }
})(typeof exports === 'undefined'? this: exports);

