/**
    tateti-ai.js
    Ta Te Ti computer player logic

    Depends on tateti.js

    Konrad Markus <konker@gmail.com>

 */

/* TODO:
    - always assume that ai is P2?
 */

var morningwood = require('./morningwood'),
    tateti = require('./tateti');

(function(exports){

    var WIN = 'win',
        LOSE = 'lose',
        UNKNOWN = 'unknown';

    ActionChoiceList = function() {
        this.choices = [];
        this.minDepth = 99;
    }
    ActionChoiceList.prototype.push = function(action, depth) {
        if (depth < this.minDepth) {
            this.choices = [action];
            this.minDepth = depth;
        }
        else if (depth == this.minDepth) {
            this.choices.push(action);
        }
    }
    ActionChoiceList.prototype.choose = function() {
        // choose a random choice
        var i = Math.floor(Math.random() * (this.choices.length - 1));
        return this.choices[i];
    }

    exports.AutoPlayer = function(board) {
        this.board = board;
        this._active = true;
    }
    exports.AutoPlayer.prototype.stop = function() {
    }

    morningwood.extend(exports, {
        _ids: null,
        _win: null,
        _unknown: null,

        init: function() {
            console.log('tateti.ai.init');
        },
        play: function(board, depth) {
            var actions = exports.getActions(board, depth); 
            exports.searchActions(actions);
            var a = exports.chooseAction();
            return a;
        },
        chooseAction: function() {
            var choice = null;
            if (exports._win.choices.length > 0) {
                // choose a winner!
                return exports._win.choose();
            }
            return exports._unknown.choose();
        },
        _testAction: function(action, c) {
            if (action.win) {
                return [WIN, c];
            }
            else if (action.lose) {
                return [LOSE, c];
            }
            else if (morningwood.sizeOf(action.children) > 0) {
                for (var child in action.children) {
                    var ret = exports._testAction(action.children[child], c+1);
                    if (ret[0] == WIN || ret[0] == LOSE) {
                        return ret;
                    }
                }
            }
            return [UNKNOWN, c];
        },
        searchActions: function(actions, c) {
            exports._win = new ActionChoiceList();
            exports._unknown = new ActionChoiceList();

            for (var a in actions) {
                var result = exports._testAction(actions[a], 1);
                console.log(result);
                if (result[0] == WIN) {
                    exports._win.push(actions[a].exec, result[1]);
                }
                else if (result[0] == UNKNOWN) {
                    exports._unknown.push(actions[a].exec, result[1]);
                }
            }
        },
        getActions: function(board, depth, c) {
            var ret = {};
            //console.log(board.toString());

            // start
            if (typeof(c) == 'undefined') {
                c = 0;
                tateti.ai._ids = {};
            }

            // end
            if (c == depth) {
                return ret;
            }

            var available = tateti.ai.getAvailableActions(board);
            for (var a in available) {
                board.exec(available[a]);

                var id = board.toIdString();
                if (!(id in tateti.ai._ids)) {
                    var p = board.checkWinningPlayer(),
                        win = (p == tateti.P2),
                        lose = (p == tateti.P1);
                    
                    ret[id] = {
                        exec: available[a],
                        win: win,
                        lose: lose,
                        children : null
                    }
                    tateti.ai._ids[id] = ret[id];

                    if (!ret[id].win && !ret[id].lose) {
                        // recurse if this is not a game-over state
                        ret[id].children = tateti.ai.getActions(board, depth, c+1);
                    }
                }
                board.undo();
            }
            return ret;
        },
        getUnsetPiece: function(board, player) {
            for (var pp in board.piecePositions[player]) {
                if (board.piecePositions[player][pp] == null) {
                    return pp;
                }
            }
            return null;
        },
        getAvailableActions: function(board) {
            // Get all available moves on board b for the next player.
            // Returns a list of action objects.
            var ret = [];
            var player = tateti.prevTurn(board.lastTurn);

            if (board.gameOver) {
                return ret;
            }

            // check if we need set or move
            if (board.countPositions(player) < 3) {
                // set
                var p = exports.getUnsetPiece(board, player),
                    legal = board.getLegalSets();

                for (var node in legal) {
                    ret.push(new tateti.BoardAction(tateti.BOARD_ACTION_TYPE_SET, p, legal[node], null));
                }
            }
            else {
                // move(s)
                var ps = board.getPositions(player);
                for (pp in ps) {
                    var p = board.get(ps[pp]),
                        node1 = board.piecePositions[player][p],
                        legal = board.getLegalMoves(node1);

                    for (var node2 in legal) {
                        ret.push(new tateti.BoardAction(tateti.BOARD_ACTION_TYPE_MOVE, p, node1, legal[node2]));
                    }
                }
            }
            return ret;
        }
    });
})(typeof exports === 'undefined'? tateti['ai']={}: exports);

