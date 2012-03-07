var morningwood = require('./morningwood'),
    tateti = require('./tateti');
    tateti.ai = require('./tateti-ai');
(function(exports){
    exports.tree = 'foo'
    ;
})(typeof exports === 'undefined'? tateti.ai['tree']={}: exports);
0
{}
