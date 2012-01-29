/**
    tateti.js
    Ta Te Ti game logic

    Konrad Markus <konker@gmail.com>
*/

/* TODO:
    - Add DRAW after x number of total moves?
*/

var tateti = (function() {

    /* node symbols */
    var A = "A";
    var B = "B";
    var C = "C";
    var D = "D";
    var E = "E";
    var F = "F";
    var G = "G";
    var H = "H";
    var I = "I";

    /* piece symbols */
    var P11 = "P11";
    var P12 = "P12";
    var P13 = "P13";
    var P21 = "P21";
    var P22 = "P22";
    var P23 = "P23";

    /* list of all nodes */
    var nodes = [A, B, C, D, E, F, G, H, I];

    /* list of all pieces */
    var pieces = [P11, P12, P13, P21, P22, P23];

    /* node state symbols */
    var EMPTY = ".";
    var P1 = "P1";
    var P2 = "P2";

    /* BoardAction types */
    var BOARD_ACTION_TYPE_SET  = 'SET';
    var BOARD_ACTION_TYPE_MOVE = 'MOVE';

    /* EVENT_TYPES */
    var EVENT_TYPE_START = 'START';
    var EVENT_TYPE_STOP  = 'STOP';
    var EVENT_TYPE_SET   = 'SET';
    var EVENT_TYPE_UNSET = 'UNSET';
    var EVENT_TYPE_MOVE  = 'MOVE';
    var EVENT_TYPE_WIN   = 'WIN';
    var EVENT_TYPE_DRAW  = 'DRAW';
    var EVENT_TYPE_RESET = 'RESET';

    var NO_HISTORY = 1;
    var NO_CHECK_TURN = 1;
    var NO_MOVE_COUNT = 1;

    /* board graph */
    var graph = {
        A: [B, D, E],
        B: [A, C, E],
        C: [B, E, F],
        D: [A, E, G],
        E: [A, B, C, D, F, G, H, I],
        F: [C, E, I],
        G: [D, E, H],
        H: [E, G, I],
        I: [E, F, H]
    };

    var wins = [
        /* horizontals */
        [A, B, C],
        [D, E, F],
        [G, H, I],

        /* verticals */
        [A, D, G],
        [B, E, H],
        [C, F, I],

        /* diagonals */
        [A, E, I],
        [C, E, G]
    ];

    /* [XXX: placeholder for i18n] */
    function _(s) {
        return s;
    }
    /* return the piece which has the next/prev turn
       to the given piece p */
    function prevMove(p) {
        if (p === P1) {
            return P2;
        }
        return P1;
    }

    /* BoardAction class */
    function BoardAction(type, p, node1, node2) {
        this.type = type;
        this.p = p;
        this.node1 = node1;
        this.node2 = node2;
    }
    BoardAction.prototype.toString = function() {
        var s = "BoardAction(" + this.type + "): " + this.p + ", " + this.node1;
        if (this.type === BOARD_ACTION_TYPE_MOVE) {
            s += "->" + this.node2;
        }
        return s;
        
    }

    /* Board class */
    function Board() {
        /* struct representing the board */
        this.rep = {};

        this.lastTurn  = null;
        this.gameOver  = false; 
        this.gameDrawn = false; 
        this.moveCount = 0;
        //
        // number of total moves which constitute a draw
        this.drawLimit = 30;

        /* initialize state to new game */
        this._reset();
    }
    Board.mixin(morningwood.Evented);

    /* facade for history undo */
    Board.prototype.undo = function() {
        return this.history.undo();
    }

    /* facade for history redo */
    Board.prototype.redo = function() {
        return this.history.redo();
    }

    /* reset the current game state */
    Board.prototype.reset = function() {
        this._reset();

        var e = new BoardEvent(EVENT_TYPE_RESET, this);
        this.dispatchEvent(e);
    }

    /* get the state of the cell at the given board node symbol */
    Board.prototype.get = function(node) {
        return this.rep[node];
    }

    /* perform an action on the given cell */
    Board.prototype.action = function(p, node2) {
        var node1 = this.getCell(p);
        if (node1) {
            this.move(node1, node2);
        }
        else {
            this.set(p, node2);
        }
    }

    /* set the state of the cell at the given board node to be EMPTY */
    Board.prototype.unset = function(action) {
        var p = this.get(action.node1);
        this._unset(action.node1);
        this.lastTurn = prevMove(tateti.getPlayer(p));
        this.moveCount--;

        var e = new BoardEvent(EVENT_TYPE_UNSET, this, action);
        this.dispatchEvent(e);
    }

    /* set the state of the cell at the given board node to be player p */
    Board.prototype.set = function(p, node1, _no_history) {
        this.checkLegalSet(p, node1);

        if (this.countPositions(P1) == 0 && this.countPositions(P2) == 0) {
            // nothing on board => game is starting
            var e = new BoardEvent(EVENT_TYPE_START, this);
            this.dispatchEvent(e);
        }

        this._set(p, node1);
        this.lastTurn = tateti.getPlayer(p);
        this.moveCount++;

        var action = new BoardAction(BOARD_ACTION_TYPE_SET, p, node1, null);
        if (!_no_history) {
            this.history.push(action);
        }

        var e = new BoardEvent(EVENT_TYPE_SET, this, action);
        this.dispatchEvent(e);

        var win = this.checkWinner();
        if (win) {
            e = new BoardEvent(EVENT_TYPE_WIN, this, action, win);
            this.dispatchEvent(e);

            e = new BoardEvent(EVENT_TYPE_STOP, this);
            this.dispatchEvent(e);
        }

        var draw = this.checkDraw();
        if (draw) {
            e = new BoardEvent(EVENT_TYPE_DRAW, this);
            this.dispatchEvent(e);

            e = new BoardEvent(EVENT_TYPE_STOP, this);
            this.dispatchEvent(e);
        }
        return;
    }

    /* make various checks and throw a BoardException on error */
    Board.prototype.checkLegalSet = function(p, node1) {
        if (this.gameOver) {
            throw new BoardException(_("Game over"), 50);
        }

        if (this.lastTurn != null) {
            if (this.lastTurn === tateti.getPlayer(p)) {
                throw new BoardException(_("Wrong turn"), 40);
            }
        }

        if (this.countPositions(tateti.getPlayer(p)) >= 3) {
            // should never actually be > 3
            console.log((p));
            console.log(tateti.getPlayer(p));
            console.log(this.countPositions(tateti.getPlayer(p)));
            throw new BoardException(_("All pieces already on board"), 40);
        }

        if (!this.isEmpty(node1)) {
            throw new BoardException(_("Not an empty slot"), 40);
        }
    }

    /* reverse a move */
    Board.prototype.unmove = function(move) {
        this.move(move.node2, move.node1, NO_HISTORY, NO_CHECK_TURN, NO_MOVE_COUNT);
        this.lastTurn = prevMove(tateti.getPlayer(move.p));
        this.moveCount--;
    }

    /* move a piece from node1 to node2 */
    Board.prototype.move = function(node1, node2, _no_history, _no_check_turn, _no_move_count) {
        this.checkLegalMove(node1, node2, _no_check_turn);

        var p = this.get(node1);
        this._unset(node1);
        this._set(p, node2);
        this.lastTurn = tateti.getPlayer(p);
        if (!_no_move_count) {
            this.moveCount++;
        }

        var action = new BoardAction(BOARD_ACTION_TYPE_MOVE, p, node1, node2);
        if (!_no_history) {
            this.history.push(action);
        }

        var e = new BoardEvent(EVENT_TYPE_MOVE, this, action);
        this.dispatchEvent(e);

        var win = this.checkWinner();
        if (win) {
            e = new BoardEvent(EVENT_TYPE_WIN, this, action, win);
            this.dispatchEvent(e);

            e = new BoardEvent(EVENT_TYPE_STOP, this);
            this.dispatchEvent(e);
        }

        var draw = this.checkDraw();
        if (draw) {
            e = new BoardEvent(EVENT_TYPE_DRAW, this);
            this.dispatchEvent(e);

            e = new BoardEvent(EVENT_TYPE_STOP, this);
            this.dispatchEvent(e);
        }
        return;
    }

    /* make various checks and throw a BoardException on error */
    Board.prototype.checkLegalMove = function(node1, node2, _no_check_turn) {
        if (this.gameOver) {
            throw new BoardException(_("Game over"), 50);
        }

        if (this.isEmpty(node1)) {
            throw new BoardException(_("Illegal move"), 20);
        }

        var p = this.get(node1);
        if (this.lastTurn != null && !_no_check_turn) {
            if (this.lastTurn === tateti.getPlayer(p)) {
                throw new BoardException(_("Wrong turn"), 40);
            }
        }

        if (this.countPositions(tateti.getPlayer(p)) < 3) {
            throw new BoardException(_("Please place all pieces on the board before moving them"), 30);
        }
         
        if (!this.isLegalMove(node1, node2)) {
            throw new BoardException(_("Illegal move"), 20);
        }
    }

    /* check if the given board node is an empty cell */
    Board.prototype.isEmpty = function(node) {
        return (this.get(node) === EMPTY);
    }

    /* check if the move from board node1 to node2 is legal */
    Board.prototype.isLegalMove = function(node1, node2) {
        if (this.isEmpty(node2)) {
            for (var legal in graph[node1]) {
                if (node2 === graph[node1][legal]) {
                    return true;
                }
            }
        }
        return false;
    }

    /* low level unset operation */
    Board.prototype._unset = function(node) {
        this.rep[node] = EMPTY;
    }
    /* low level set operation */
    Board.prototype._set = function(p, node1) {
        this.rep[node1] = p;
    }
    /* low level clear operation */
    Board.prototype._clear = function() {
        for (var node in nodes) {
            this.rep[nodes[node]] = EMPTY;
        }
    }
    /* low level reset operation */
    Board.prototype._reset = function() {
        this._clear();

        this.lastTurn = null;
        this.gameOver = false; 
        this.gameDrawn = false; 
        this.moveCount = 0;

        /* track history */
        this.history = new History(this);
    }

    /* get the cell for a given piece. null if not on the board */
    Board.prototype.getCell = function(p) {
        for (var node in this.rep) {
            if (this.get(node) == p) {
                return node;
            }
        }
        return null;
    }

    /* count the number of all pieces on the board */
    Board.prototype.countAllPositions = function() {
        var count = 0;
        for (var node in this.rep) {
            if (tateti.getPlayer(this.get(node)) !== EMPTY) {
                ++count;
            }
        }
        return count;
    }

    /* count the number of pieces the given player p
       has on the board */
    Board.prototype.countPositions = function(p) {
        var count = 0;
        for (var node in this.rep) {
            if (tateti.getPlayer(this.get(node)) === p) {
                ++count;
            }
        }
        return count;
    }

    /* get the piece position of the given piece p
       as a board symbol */
    Board.prototype.getPosition = function(p) {
        for (var node in this.rep) {
            if (this.rep[node] === p) {
                return node;
            }
        }
        return null;
    }

    /* get the piece positions of the given player p
       as an array of board symbols */
    Board.prototype.getPositions = function(p) {
        var positions = [];
        for (var node in this.rep) {
            if (rep[node] === p) {
                positions.push(node);
            }
        }
        return positions;
    }

    /* check if the board has a winning combination.
       If so, return an structure of the winning board nodes;
       otherwise return null */
    Board.prototype.checkWinner = function() {
        var ret = null;
        for (var i in wins) {
            var p1 = tateti.getPlayer(this.get(wins[i][0]));
            var p2 = tateti.getPlayer(this.get(wins[i][1]));
            var p3 = tateti.getPlayer(this.get(wins[i][2]));

            if (p1 != EMPTY && p1 === p2 && p2 === p3) {
                this.gameOver = true;
                ret = {
                    win: wins[i],
                    winner: p3
                }
            }
        }
        return ret;
    }

    /* check if the the move count has reached the draw limit */
    Board.prototype.checkDraw = function() {
        if (this.moveCount == this.drawLimit) {
            this.gameOver = true;
            this.gameDrawn = true;
            return true;
        }
        return false;
    }

    Board.prototype.toString = function() {
        function _pad(p) {
            switch (p) {
                case P11:
                case P12:
                case P13:
                case P21:
                case P22:
                case P23:
                    return p + " ";
                default:
                    return " " + p + "  ";
            }
        }

        var s = "-----------------\n";
        var c = 1;
        for (var node in this.rep) {
            s += "| ";

            s += _pad(this.get(node));

            if (c % 3 == 0) {
                s += "|\n";
            }
            c++;
        }
        s += " -----------------";
        return s;
    }

    /* history class */
    function History(board) {
        this.board = board;

        // maintain a history of moves as a list of BoardAction objs
        this.rep = [],
        this.ptr = -1;
    }
    /* push an event on to the history stack */
    History.prototype.push = function(move) {
        this.rep = this.rep.slice(0, this.ptr+1);
        this.rep.push(move);
        ++this.ptr;
    
    }
    /* move one step back in history if possible */
    History.prototype.undo = function() {
        if (this.canUndo()) {
            var action = this.rep[this.ptr];
            if (this.ptr == -1) {
                this.board.lastTurn = null;
            }
            else {
                --this.ptr;
            }

            if (action.type === BOARD_ACTION_TYPE_MOVE) {
                this.board.unmove(action);
            }
            else {
                this.board.unset(action);
            }

            this.board.gameOver = false;
            this.board.gameDrawn = false;
            var e = new BoardEvent(EVENT_TYPE_START, this);
            this.board.dispatchEvent(e);
            return action;
        }
        return null;
    }
    /* move one step forwards in history if possible */
    History.prototype.redo = function() {
        if (this.canRedo()) {
            var action = this.rep[this.ptr+1];
            if (action.type === BOARD_ACTION_TYPE_MOVE) {
                this.board.move(action.node1, action.node2, NO_HISTORY);
            }
            else {
                this.board.set(action.p, action.node1, NO_HISTORY);
            }
            ++this.ptr;
            return action;
        }
        return null;
    }
    /* test to see if undo is possible */
    History.prototype.canUndo = function() {
        return (this.ptr >= 0);
    }
    /* test to see if redo is possible */
    History.prototype.canRedo = function() {
        return (this.rep.length > (this.ptr + 1));
    }
    History.prototype.len = function() {
        return this.rep.length;
    }
    History.prototype.toString = function() {
        var s = "ptr: " + this.ptr + "\n";
        for (var move in this.rep) {
            s += this.rep[move];
            s += " | ";
        }
        return s;
    }

    /* event class */
    function BoardEvent(type, target, move, win) {
        this.type = type;
        this.target = target;
        this.move = move || null;
        this.win = win || null;
    }
    BoardEvent.prototype.toString = function() {
        var s = "BoardEvent: " + this.type;
        if (this.move) {
            s += ", " + this.move
        }
        if (this.win) {
            s += ", WIN: " + this.win;
        }
        return s;
    }

    /* exception class */
    function BoardException(msg, code) {
        this.msg = msg;
        this.code = code || -1;
    }
    BoardException.prototype.toString = function() {
        return this.msg;
    }

    /* public interface */
    return {
        A: A,
        B: B,
        C: C,
        D: D,
        E: E,
        F: F,
        G: G,
        H: H,
        I: I,

        nodes: nodes,

        P11: P11,
        P12: P12,
        P13: P13,
        P21: P21,
        P22: P22,
        P23: P23,

        pieces: pieces,
        
        P1: P1,
        P2: P2,

        EVENT_TYPE_START: EVENT_TYPE_START,
        EVENT_TYPE_STOP:  EVENT_TYPE_STOP,
        EVENT_TYPE_SET:   EVENT_TYPE_SET,
        EVENT_TYPE_UNSET: EVENT_TYPE_UNSET,
        EVENT_TYPE_MOVE:  EVENT_TYPE_MOVE,
        EVENT_TYPE_WIN:   EVENT_TYPE_WIN,
        EVENT_TYPE_DRAW:  EVENT_TYPE_DRAW,
        EVENT_TYPE_RESET: EVENT_TYPE_RESET,

        Board: Board,
        BoardAction: BoardAction,
        BoardEvent: BoardEvent,
        BoardException: BoardException,
        History: History,

        /* return the player to which a given piece belongs */
        getPlayer: function(p) {
            if (p.indexOf(P1) == 0) {
                return P1;
            }
            else if (p.indexOf(P2) == 0) {
                return P2;
            }
            return EMPTY;
        }
    }
})();

