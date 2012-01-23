/**
    tateti.js
    Ta Te Ti game logic

    Konrad Markus <konker@gmail.com>
*/

/* TODO:
    - Should some current exceptions be converted into events?
        - Exceptions for system errors rather than game-play errors?

    - Do we need START/STOP events?

    - History/undo/redo
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

    /* list of all nodes */
    var nodes = [A,B,C,D,E,F,G,H,I];

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
    var EVENT_TYPE_MOVE  = 'MOVE';
    var EVENT_TYPE_WIN   = 'WIN';
    var EVENT_TYPE_RESET = 'RESET';

    var NO_HISTORY = 1;

    /* board graph */
    var graph = {
        A: [B,D,E],
        B: [A,C,E],
        C: [B,E,F],
        D: [A,E,G],
        E: [A,B,C,D,F,G,H,I],
        F: [C,E,I],
        G: [D,E,H],
        H: [E,G,I],
        I: [E,F,H]
    }

    var wins = [
        /* horizontals */
        [A,B,C],
        [D,E,F],
        [G,H,I],

        /* verticals */
        [A,D,G],
        [B,E,H],
        [C,F,I],

        /* diagonals */
        [A,E,I],
        [C,E,G]
    ]

    /* [XXX: placeholder for i18n] */
    function _(s) {
        return s;
    }
    /* return the piece which has the next/prev turn
       to the given piece p */
    function prevMove(p) {
        if (p == P1) {
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
        if (this.type == BOARD_ACTION_TYPE_MOVE) {
            s += "->" + this.node2;
        }
        return s;
        
    }

    /* Board class */
    function Board() {
        /* struct representing the board */
        this.rep = {};
        for (var node in nodes) {
            this.rep[nodes[node]] = EMPTY;
        }

        this.lastTurn = null;
        this.gameOver = false; 

        /* track history */
        this.history = new History(this);
    }
    Board.mixin(morningwood.Evented);

    /* get the state of the cell at the given board node symbol */
    Board.prototype.get = function(node) {
        return this.rep[node];
    }
    /* low level unset operation */
    Board.prototype._unset = function(node) {
        this.rep[node] = EMPTY;
    }
    /* low level set operation */
    Board.prototype._set = function(p, node1) {
        this.rep[node1] = p;
    }

    /* set the state of the cell at the given board node to be EMPTY */
    Board.prototype.unset = function(move) {
        var p = this.get(move.node1);
        this._unset(move.node1);
        this.lastTurn = prevMove(p);
    }

    /* set the state of the cell at the given board node to be player p */
    Board.prototype.set = function(p, node1, _no_history) {
        this.checkLegalSet(p, node1);

        if (this.countPositions(P1) == 0 && this.countPositions(P2) == 0) {
            // nothing on board => game is starting
            var e = new BoardEvent(EVENT_TYPE_START, this, null, null);
            this.dispatchEvent(e);
        }

        this._set(p, node1);
        this.lastTurn = p;

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

            e = new BoardEvent(EVENT_TYPE_STOP, this, null, null);
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
            if (this.lastTurn == p) {
                throw new BoardException(_("Wrong turn"), 40);
            }
        }
        if (this.countPositions(p) >= 3) {
            // should never actually be > 3
            throw new BoardException(_("All pieces already on board"), 40);
        }

        if (!this.isEmpty(node1)) {
            throw new BoardException(_("Not an empty slot"), 40);
        }
    }

    /* reverse a move */
    Board.prototype.unmove = function(move) {
        this.move(move.node2, move.node1, NO_HISTORY);
    }
    /* move a piece from node1 to node2 */
    Board.prototype.move = function(node1, node2, _no_history) {
        this.checkLegalMove(node1, node2);

        var p = this.get(node1);
        this._unset(node1);
        this._set(p, node2);
        this.lastTurn = p;

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

            e = new BoardEvent(EVENT_TYPE_STOP, this, null, null);
            this.dispatchEvent(e);
        }
        return;
    }

    /* make various checks and throw a BoardException on error */
    Board.prototype.checkLegalMove = function(node1, node2) {
        if (this.gameOver) {
            throw new BoardException(_("Game over"), 50);
        }
        if (this.isEmpty(node1)) {
            throw new BoardException(_("Illegal move: ") + node1 + "->" + node2, 20);
        }

        var p = this.get(node1);
        if (this.countPositions(p) < 3) {
            throw new BoardException(_("Please place all pieces on the board before moving them" + p), 30);
        }
         
        if (!this.isLegalMove(node1, node2)) {
            throw new BoardException(_("Illegal move: ") + node1 + "->" + node2, 20);
        }
    }

    /* check if the given board node is an empty cell */
    Board.prototype.isEmpty = function(node) {
        return (this.get(node) == EMPTY);
    }
    /* check if the move from board node1 to node2 is legal */
    Board.prototype.isLegalMove = function(node1, node2) {
        if (this.isEmpty(node2)) {
            for (var legal in graph[node1]) {
                if (node2 == graph[node1][legal]) {
                    return true;
                }
            }
        }
        return false;
    }

    /* count the number of pieces the given player p
       has on the board */
    Board.prototype.countPositions = function(p) {
        var count = 0;
        for (var node in this.rep) {
            if (this.get(node) == p) {
                ++count;
            }
        }
        return count;
    }

    /* get the piece positions of the given player p
       as an array of board symbols */
    Board.prototype.getPositions = function(p) {
        var positions = [];
        for (var node in this.rep) {
            if (rep[node] == p) {
                positions.push(node);
            }
        }
        return positions;
    }

    /* check if the board has a winning combination.
       If so, return an array of the winning board nodes;
       otherwise return null */
    Board.prototype.checkWinner = function() {
        for (var i in wins) {
            var p1 = this.get(wins[i][0]);
            var p2 = this.get(wins[i][1]);
            var p3 = this.get(wins[i][2]);

            if (p1 != EMPTY && p1 == p2 && p2 == p3) {
                this.gameOver = true;
                return wins[i];
            }
        }
        return null;
    }
    Board.prototype.toString = function() {
        function _pad(p) {
            switch (p) {
                case P1:
                case P2:
                    return p + " ";
                default:
                    return p + "  ";
            }
        }

        var s = " --------------\n";
        var c = 1;
        for (var node in this.rep) {
            s += "| ";

            s += _pad(this.get(node));

            if (c % 3 == 0) {
                s += "|\n";
            }
            c++;
        }
        s += " --------------\n";
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
            var item = this.rep[this.ptr];
            if (this.ptr == 0) {
                this.board.lastTurn = null;
            }
            else {
                --this.ptr;
            }

            if (item.type == BOARD_ACTION_TYPE_MOVE) {
                this.board.unmove(item);
            }
            else {
                this.board.unset(item);
            }
            this.board.gameOver = false;
            return item;
        }
        return null;
    }
    /* move one step forwards in history if possible */
    History.prototype.redo = function() {
        if (this.canRedo()) {
            var action = this.rep[this.ptr+1];
            if (action.type == BOARD_ACTION_TYPE_MOVE) {
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
        
        P1: P1,
        P2: P2,

        EVENT_TYPE_START: EVENT_TYPE_START,
        EVENT_TYPE_STOP:  EVENT_TYPE_STOP,
        EVENT_TYPE_SET:   EVENT_TYPE_SET,
        EVENT_TYPE_MOVE:  EVENT_TYPE_MOVE,
        EVENT_TYPE_WIN:   EVENT_TYPE_WIN,
        EVENT_TYPE_RESET: EVENT_TYPE_RESET,

        Board: Board,
        BoardAction: BoardAction,
        BoardEvent: BoardEvent,
        BoardException: BoardException,
        History: History,
    }
})();
var foo = new Object();
foo.onevent = function(e) {
    console.log("EVENT RECV: " + e);
    console.log('-------H-------');
    console.log(e.target.history.toString());
    console.log('-------H-------');
}
var b = new tateti.Board();
b.addEventListener(tateti.EVENT_TYPE_START, foo.onevent);
b.addEventListener(tateti.EVENT_TYPE_STOP, foo.onevent);
b.addEventListener(tateti.EVENT_TYPE_RESET, foo.onevent);
b.addEventListener(tateti.EVENT_TYPE_MOVE, foo.onevent);
b.addEventListener(tateti.EVENT_TYPE_SET, foo.onevent);
b.addEventListener(tateti.EVENT_TYPE_WIN, foo.onevent);

console.log(b.toString());
b.set(tateti.P1, tateti.A);
console.log(b.toString() + "\n");
console.log("UNDO");
b.history.undo();
console.log(b.toString() + "\n");
b.set(tateti.P1, tateti.A);
console.log(b.toString() + "\n");
b.set(tateti.P2, tateti.B);
console.log(b.toString() + "\n");
b.set(tateti.P1, tateti.C);
console.log(b.toString() + "\n");
b.set(tateti.P2, tateti.E);
console.log(b.toString() + "\n");
b.set(tateti.P1, tateti.G);
console.log(b.toString() + "\n");
b.set(tateti.P2, tateti.I);
console.log(b.toString() + "\n");
b.move(tateti.G, tateti.D);
console.log(b.toString() + "\n");
console.log("UNDO");
b.history.undo();
console.log(b.toString() + "\n");
console.log("REDO");
b.history.redo();
console.log(b.toString() + "\n");
b.move(tateti.C, tateti.F);
console.log(b.toString() + "\n");
b.move(tateti.I, tateti.H);
console.log(b.toString() + "\n");

