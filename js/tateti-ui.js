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
    _stopped: false,
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
    draw: function() {
        for (var i in tateti.pieces) {
            var p = tateti.pieces[i]; 
            var node = tateti.ui.board.getPosition(p);
            if (node) {
                // draw piece on board in cell position 'node'
                tateti.ui.piece.draw(
                    p,
                    tateti.ui.cell.pos[node].left,
                    tateti.ui.cell.pos[node].top
                );
            }
            else {
                // draw piece in home position
                tateti.ui.piece.draw(
                    p,
                    tateti.ui.piece.pos[p].left,
                    tateti.ui.piece.pos[p].top
                );
            }
        }
    },
    audio: {
        _enabled: false,
        muted: false,
        _audio: null,

        res: {
            tap:   'mp3/tap.mp3',
            blip:  'mp3/blip.mp3',
            error: 'mp3/error.mp3',
            win:   'mp3/win.mp3',
        },

        preload: function() {
            tateti.ui.audio._enabled = !!(document.createElement('audio').canPlayType);
            if (navigator.userAgent.toLowerCase().indexOf("iphone") != -1 ||
                navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                tateti.ui.audio._enabled = false;
            }
            
            if (tateti.ui.audio._enabled) {
                for (var n in tateti.ui.audio.res) {
                    var a = new Audio(tateti.ui.audio.res[n]);
                }
            }
        },
        play: function(n) {
            if (tateti.ui.audio._enabled && !tateti.ui.audio.muted) {
                if (tateti.ui.audio._audio) {
                    tateti.ui.audio._audio.pause();
                }
                tateti.ui.audio._audio = new Audio(tateti.ui.audio.res[n]);
                tateti.ui.audio._audio.play();
            }
        },
        toggleMute: function() {
            if (tateti.ui.audio.muted) {
                tateti.ui.audio.unmute();
                return true;
            }
            else {
                tateti.ui.audio.mute();
                return false;
            }
        },
        mute: function() {
            tateti.ui.audio.muted = true;
        },
        unmute: function() {
            tateti.ui.audio.muted = false;
        }
    },
    cell: {
        pos: {
            A: { top: 118, left: 18 },
            B: { top: 118, left: 120 },
            C: { top: 118, left: 220 },
            D: { top: 219, left: 18 },
            E: { top: 219, left: 120 },
            F: { top: 219, left: 220 },
            G: { top: 321, left: 18 },
            H: { top: 321, left: 120 },
            I: { top: 321, left: 220 }
        },
        init: function() {
            tateti.ui.cell.positionInit();

            $('.cell').each(function() {
                $(this).bind('click', tateti.ui.cell.click);
            });
        },
        click: function(e) {
            var node = $(e.target).attr('id');

            if (!tateti.ui._stopped) {
                try {
                    tateti.ui.board.action(tateti.ui.piece.selectedId, node);
                }
                catch(ex) {
                    tateti.ui.audio.play('error');
                    tateti.ui.message.errorFlash()
                    tateti.ui.piece.deselect();
                }
            }
        },
        draw: function(node, left, top) {
            $('#' + node)
               .css('left', left)
               .css('top', top)
               .css('display', 'block');
        },
        positionInit: function() {
            // set the initial positions of the cells
            for (var n in tateti.nodes) {
                var node = tateti.nodes[n];
                tateti.ui.cell.draw(
                    node, 
                    tateti.ui.cell.pos[node].left,
                    tateti.ui.cell.pos[node].top
                );
            }
        }
    },
    piece: {
        selected: null,
        selectedId: null,

        pos: {
            P11: { top: 40, left: 6 },
            P12: { top: 40, left: 59 },
            P13: { top: 40, left: 112 },

            P21: { top: 404, left: 131 },
            P22: { top: 404, left: 184 },
            P23: { top: 404, left: 237 },
        },
        init: function() {
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
            tateti.ui.piece.selected.removeClass('ui-selected');
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
        }
    },
    events: {
        init: function() {
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_START, tateti.ui.events.onstart);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_STOP, tateti.ui.events.onstop);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_RESET, tateti.ui.events.onreset);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_MOVE, tateti.ui.events.onaction);
            tateti.ui.board.addEventListener(tateti.EVENT_TYPE_SET, tateti.ui.events.onaction);
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
            $('#message').hide();
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
    }
}
$(tateti.ui.init);

