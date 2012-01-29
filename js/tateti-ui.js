/**
    tateti-ui.js
    Ta Te Ti user interface logic

    Depends on tateti.js

    Konrad Markus <konker@gmail.com>

 */

(function(){
    if (typeof(tateti) == 'undefined') {
        throw "tateti object dependency not found";
    }

    /* [XXX: placeholder for i18n] */
    function _(s) {
        return s;
    }

    var errorMessages = {
        40: _("Illegal move"),
        41: _("Game over"),
        42: _("Wrong turn"),
        43: _("All pieces already on board"),
        44: _("Place all pieces on the board before moving them")
    };

    var IS_ERROR = 1;

    /* class to abstract basic audio playback funcitonality */
    tateti.Audio = function(url) {
        if (typeof PhoneGap !== "undefined") {
            this._is_phonegap = true;
        }
        if (this._is_phonegap) {
            this.rep = new Media('/android_asset/www/' + url);
        }
        else {
            this.rep = new Audio(url);
        }
    }
    tateti.Audio.prototype.play = function() {
        this.rep.play();
    }
    tateti.Audio.prototype.pause = function() {
        this.rep.pause();
        if (this._is_phonegap) {
            this.rep.release();
        }
    }


    tateti.ui = {
        _inited: false,
        _stopped: false,
        _is_phonegap: false,

        board: null,

        init: function() {
            if (typeof PhoneGap !== "undefined") {
                tateti.ui._is_phonegap = true;
            }

            // preload audio
            tateti.ui.audio.init();
            
            // create the logical board
            tateti.ui.board = new tateti.Board();
            tateti.ui.board.drawLimit = 30;

            // initialize cells
            tateti.ui.cell.init();

            // initialize pieces
            tateti.ui.piece.init();

            // initialize event listeners
            tateti.ui.events.init();

            // initialize message system
            tateti.ui.message.init();

            // initialize status system
            tateti.ui.status.init();
            tateti.ui.status.set('moves', tateti.ui.board.moveCount + '/' + tateti.ui.board.drawLimit);
            tateti.ui.status.set('time', '-:--');

            // initialize timer system
            tateti.ui.timer.init();

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

            init: function() {
                tateti.ui.audio._enabled = !!(document.createElement('audio').canPlayType);
                if (tateti.ui._is_phonegap) {
                    tateti.ui.audio._enabled = true;
                }
                /*
                //[FIXME: why is this?]
                if (navigator.userAgent.toLowerCase().indexOf("iphone") != -1 ||
                    navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                    tateti.ui.audio._enabled = false;
                }
                */

                //[FIXME: what about preload?]
            },
            preload: function() {
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
                    tateti.ui.audio._audio = new tateti.Audio(tateti.ui.audio.res[n]);
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
                    if (tateti.ui.piece.selected) {
                        try {
                            tateti.ui.board.action(tateti.ui.piece.selectedId, node);
                            tateti.ui.status.set('moves', tateti.ui.board.moveCount + '/' + tateti.ui.board.drawLimit);
                            if (!tateti.ui._stopped) {
                                tateti.ui.status.set('time', '-:--');
                                tateti.ui.status.setCritical('time', false);
                                tateti.ui.timer.down.restart();
                            }
                        }
                        catch(ex) {
                            console.log(ex);
                            tateti.ui.audio.play('error');
                            tateti.ui.message.flash(
                                errorMessages[ex.code],
                                tateti.getPlayer(tateti.ui.piece.selectedId),
                                IS_ERROR
                            );
                            tateti.ui.piece.deselect();
                        }
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
                P11: { top: 404, left: 131 },
                P12: { top: 404, left: 184 },
                P13: { top: 404, left: 237 },

                P21: { top: 40, left: 6 },
                P22: { top: 40, left: 59 },
                P23: { top: 40, left: 112 }
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
            }
        },
        events: {
            init: function() {
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_START, tateti.ui.events.onstart);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_STOP, tateti.ui.events.onstop);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_RESET, tateti.ui.events.onreset);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_MOVE, tateti.ui.events.onaction);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_SET, tateti.ui.events.onaction);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_UNSET, tateti.ui.events.onaction);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_WIN, tateti.ui.events.onwin);
                tateti.ui.board.addEventListener(tateti.EVENT_TYPE_DRAW, tateti.ui.events.ondraw);
            },
            onstart: function(e) {
                tateti.ui._stopped = false;
            },
            onstop: function(e) {
                tateti.ui._stopped = true;
                tateti.ui.timer.stop();
                // [TODO: add class to all pieces/cells to remove finger cursor ?]
            },
            onreset: function(e) {
                tateti.ui.draw();
                tateti.ui.piece.deselect();
                tateti.ui.message.hide();
                // [TODO: remove class to all pieces/cells to add finger cursor ?]
            },
            onaction: function(e) {
                tateti.ui.draw();
                tateti.ui.piece.deselect();
                tateti.ui.audio.play('blip');
            },
            onwin: function(e) {
                var w = e.win.winner;
                if (w) {
                    tateti.ui.audio.play('win');
                    $('.piece.' + w).effect('pulsate', { times: 5 }, 'slow');
                }
                tateti.ui.message.show(_("Winner!"), w);
            },
            ondraw: function(e) {
                tateti.ui.audio.play('win');
                $('.piece').effect('pulsate', { times: 5 }, 'slow');
                tateti.ui.message.show(_("Game drawn!"));
                tateti.ui.timer.stop();
            }
        },
        timer: {
            DEFAULT_MOVE_TIME_LIMIT_SECS: 20,
            CRITICAL_TIME_SECS: 10,

            moveTimeLimitSecs: -1,

            init: function() {
                tateti.ui.timer.moveTimeLimitSecs = tateti.ui.timer.DEFAULT_MOVE_TIME_LIMIT_SECS;
            },
            stop: function() {
                tateti.ui.timer.up.stop();
                tateti.ui.timer.down.stop();
            },
            up: {
                secs: null,
                _iid: null,

                start: function() {
                    tateti.ui.timer.up._iid = setInterval(tateti.ui.timer.up._tick, 1000);
                },
                reset: function() {
                    tateti.ui.timer.up.secs = 0;
                },
                stop: function() {
                    clearInterval(tateti.ui.timer.up._iid);
                },
                restart: function() {
                    tateti.ui.timer.up.stop();
                    tateti.ui.timer.up.reset();
                    tateti.ui.timer.up.start();
                },
                _tick: function() {
                    tateti.ui.timer.up.secs += 1;
                    tateti.ui.timer.up.ontick();
                },
                ontick: function() {
                    tateti.ui.status.set('time', tateti.ui.timer.formatTime(tateti.ui.timer.secs));
                }
            },
            down: {
                secs: null,
                _iid: null,

                start: function() {
                    tateti.ui.timer.down._iid = setInterval(tateti.ui.timer.down._tick, 1000);
                },
                reset: function() {
                    tateti.ui.timer.down.secs = 0;
                },
                stop: function() {
                    clearInterval(tateti.ui.timer.down._iid);
                },
                restart: function() {
                    tateti.ui.timer.down.stop();
                    tateti.ui.timer.down.reset();
                    tateti.ui.timer.down.start();
                },
                _tick: function() {
                    tateti.ui.timer.down.secs += 1;
                    tateti.ui.timer.down.ontick();
                },
                ontick: function() {
                    var t = tateti.ui.timer.moveTimeLimitSecs - tateti.ui.timer.down.secs; 
                    var isCritical = (t <= tateti.ui.timer.CRITICAL_TIME_SECS);
                    var p = tateti.prevTurn(tateti.ui.board.lastTurn);

                    tateti.ui.status.set('time', tateti.ui.timer.formatTime(t), p);
                    tateti.ui.status.setCritical('time', isCritical, p);
                    if (t == 0) {
                        tateti.ui.timer.down.stop();
                        tateti.ui.timer.down.onzero();
                    }
                },
                onzero: function() {
                    tateti.ui.board.forceWinner(tateti.ui.board.lastTurn);
                }
            },
            formatTime: function(t) {
                function pad(n) {
                    return (n < 10) ? ('0' + n) : (n);
                }
                var m = (t - (t % 60)) / 60;
                return m + ':' + pad(t - (m * 60));
            }
        },
        status: {
            init: function() {
                tateti.ui.status.set('moves', tateti.ui.board.moveCount + '/' + tateti.ui.board.drawLimit);
            },
            set: function(field, value, p) {
                var selector1 = '.status dd.' + field; 
                if (typeof(p) !== 'undefined') {
                    var selector1 = '.status.' + p + ' dd.' + field; 
                }
                $(selector1).html(value);
            },
            setCritical: function(field, critical, p) {
                var selector1 = '.status dd.' + field; 
                if (typeof(p) !== 'undefined') {
                    var selector1 = '.status.' + p + ' dd.' + field; 
                }
                $(selector1).removeClass('critical');
                if (critical) {
                    $(selector1).addClass('critical');
                }
            }
        },
        message: {
            FLASH_DELAY: 2500,
            VISUAL_ERROR_BELL_ON_DELAY: 0,
            VISUAL_ERROR_BELL_OFF_DELAY: 750,

            init: function() {
                $('.message.' + tateti.P1).bind('click', function() {
                    tateti.ui.message.hide(tateti.P1);
                    return false;
                });
                $('.message.' + tateti.P2).bind('click', function() {
                    tateti.ui.message.hide(tateti.P2);
                    return false;
                });
            },
            show: function(s, p) {
                var selector1 = '.message .content';
                var selector2 = '.message';
                if (typeof(p) !== 'undefined') {
                    selector1 = '.message.'+ p +' .content';
                    selector2 = '.message.'+ p;
                }
                $(selector1).html(s);
                $(selector2).show();
            },
            flash: function(s, p, is_error) {
                tateti.ui.message.show(s, p);
                setTimeout(function() {
                        tateti.ui.message.hide(p);
                    },
                    tateti.ui.message.FLASH_DELAY
                );
                if (is_error) {
                    tateti.ui.message.visualErrorBell();
                }
            },
            hide: function(p) {
                var selector1 = '.message';
                if (typeof(p) !== 'undefined') {
                    selector1 = '.message.' + p;
                }
                $(selector1).hide();
            },
            visualErrorBell: function() {
                setTimeout(tateti.ui.message._visual_error_on, tateti.ui.message.VISUAL_ERROR_BELL_ON_DELAY);
            },
            _visual_error_on: function() {
                $('body').removeClass().addClass('error');
                setTimeout(tateti.ui.message._visual_error_off, tateti.ui.message.VISUAL_ERROR_BELL_OFF_DELAY);
           },
            _visual_error_off: function() {
                $('body').removeClass();
           }
        }
    }
})();
$(tateti.ui.init);

