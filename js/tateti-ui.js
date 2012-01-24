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
        tateti.ui.menu.init();

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
<<<<<<< HEAD
            tateti.ui.piece.positionInit();

            $('.piece').each(function() {
                $(this).bind('click', tateti.ui.piece.click);
            });
        },
        click: function(e) {
            var p = $(e.target);

            if (!tateti.ui._stopped) {
                if (tateti.ui.piece.selectedId == p.attr('id')) {
                    tateti.ui.piece.deselect();
                }
                else {
                    tateti.ui.piece.select(p);
                }
                tateti.ui.audio.play('tap');
            }
        },
        deselect: function(p) {
            if (tateti.ui.piece.selected) {
                tateti.ui.piece.selected.removeClass('ui-selected');
            }
            tateti.ui.piece.selected = null;
            tateti.ui.piece.selectedId = null
        },
        select: function(p) {
            if (tateti.ui.piece.selected) {
                tateti.ui.piece.deselect();
            }
            tateti.ui.piece.selected = p;
            tateti.ui.piece.selected.addClass('ui-selected');
            tateti.ui.piece.selectedId = p.attr('id');
        },
        draw: function(piece, left, top) {
            $('#' + piece)
               .css('left', left)
               .css('top', top)
               .css('display', 'block');
        },
        positionInit: function() {
            // set the initial positions of the cells
            for (var p in tateti.pieces) {
                var piece = tateti.pieces[p];
                tateti.ui.piece.draw(
                    piece, 
                    tateti.ui.piece.pos[piece].left,
                    tateti.ui.piece.pos[piece].top
                );
            }
=======
>>>>>>> parent of 02a06c3... Added sounds and basic UI functionality
        }
    },
    events: {
        init: function() {
<<<<<<< HEAD
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_START, tateti.ui.events.onstart);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_STOP, tateti.ui.events.onstop);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_RESET, tateti.ui.events.onreset);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_MOVE, tateti.ui.events.onaction);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_SET, tateti.ui.events.onaction);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_UNSET, tateti.ui.events.onaction);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_WIN, tateti.ui.events.onwin);
        },
        onstart: function(e) {
            console.log("onstart: " + e);
        },
        onstop: function(e) {
            console.log("onstop: " + e);
            tateti.ui._stopped = true;
            // [TODO: add class to all pieces/cells to remove finger cursor ?]
        },
        onreset: function(e) {
            console.log("onreset: " + e);
        },
        onaction: function(e) {
            console.log("onaction: " + e);
            tateti.ui.draw();
            tateti.ui.piece.deselect();
            tateti.ui.audio.play('blip');
        },
        onwin: function(e) {
            var w = e.win.winner;
            console.log("onwin: " + w);
            if (w) {
                tateti.ui.audio.play('win');
                $('.' + w).effect('pulsate', { times: 5 }, 'slow');
            }
        }
    },
    message: {
        init: function() {
            $('#message').css({opacity: .65}).show();
            $('#message').bind('click', tateti.ui.message.hide);
        },
        show: function(s) {
            $('#message .content').html(s);
            $('#message').show();
        },
        hide: function() {
            $('#message').hide();
        },
        errorFlash: function() {
            setTimeout(tateti.ui.message._red, 200);
        },
        _red: function() {
            $('#wrapper').css('background', '#a00');
            setTimeout(tateti.ui.message._white, 750);
       },
        _white: function() {
            $('#wrapper').css('background', '#fff');
       }
    },
    menu: {
        init: function() {
            $('#menu').bind('click', tateti.ui.menu.open);

            $('#menu-dialog .close a').bind('click', tateti.ui.menu.close);
            $('#menu-dialog .undo a').bind('click', tateti.ui.menu.undo);
            $('#menu-dialog .redo a').bind('click', tateti.ui.menu.redo);
            $('#menu-dialog .reset a').bind('click', tateti.ui.menu.reset);
            $('#menu-dialog .mute a').bind('click', tateti.ui.menu.mute);
            $('#menu-dialog .help a').bind('click', tateti.ui.menu.help);
        },
        open: function() {
            $('#menu-overlay')
                .css('width', $('#wrapper').width())
                .show();
            $('#menu-dialog')
                .css('width', $('#wrapper').width() - 4)
                .fadeIn('normal');
            return false;
        },
        close: function() {
            $("#menu-overlay").hide();
            $('#menu-dialog').hide();
            return false;
        },
        
        undo: function() {
            console.log("UNDO");
            tateti.ui.board.history.undo();
            console.log(tateti.ui.board.toString());
            console.log(tateti.ui.board.lastTurn);
            console.log(tateti.ui.board.history.toString());
            return false;
        },
        redo: function() {
            console.log("REDO");
            tateti.ui.board.history.redo();
            console.log(tateti.ui.board.toString());
            console.log(tateti.ui.board.lastTurn);
            console.log(tateti.ui.board.history.toString());
            return false;
        },
        reset: function() {
            if (tateti.ui.board.gameOver || confirm('Are you sure you want to restart the game?')) {
                tateti.ui.board.reset();
                tateti.ui.menu.close();
            }
            return false;
        },
        mute: function() {
            if (tateti.ui.audio.toggleMute()) {
                $('#menu-dialog .mute')
                    .removeClass('muted')
                    .addClass('unmuted')
                    .find('a')
                    .html('mute');
            }
            else {
                $('#menu-dialog .mute')
                    .removeClass('unmuted')
                    .addClass('muted')
                    .find('a')
                    .html('unmute');
            }
            return false;
        },
        help: function() {
            alert(_("Object: get 3 in a row; any horizontal, diagonal or vertical 3 is good. Once pieces are on the board, move them one space along the black lines."));
            return false;
        }
    },

=======
        }
    }
>>>>>>> parent of 02a06c3... Added sounds and basic UI functionality
}
$(tateti.ui.init);

