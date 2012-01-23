/**
    tateti-ui.js
    Ta Te Ti user interface logic

    Depends on tateti.js

    Konrad Markus <konker@gmail.com>

 */

if (typeof(tateti) == 'undefined') {
    throw "tateti object dependency not found";
}
tateti.ui = {
    _inited: false,
    board: null,

    init: function() {
        // preload audio
        tateti.ui.audio.preload();
        
        // create the logical board
        tateti.ui.board = new tateti.Board();

        // initialize cells
        tateti.ui.cell.init();

        // initialize pieces
        tateti.ui.piece.init();

        // initialize event listeners
        tateti.ui.events.init();

        // initialize the menu
        ///tateti.ui.menu.init();

        tateti.ui._inited = true;
    },
    audio: {
        preload: function() {
        }
    },
    cell: {
        init: function() {
        }
    },
    piece: {
        init: function() {
        }
    },
    events: {
        init: function() {
        }
    }
}
$(tateti.ui.init);

