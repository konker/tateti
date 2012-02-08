/** morningwood.js

    Provide utility and helper funcitonality.
    - extend:
        - Extend one object with the properties of another.
        - Used for instance in declaring sub modules.

    - Evented:
        - Provide basic event listening/dispatching

    Konrad Markus <konker@gmail.com>
*/


(function(exports){
    exports.extend = function(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    Function.prototype.mixin = function(m) {
        var that = this;
        that.prototype = new m();
        for (var p in m.prototype) {
            if (m.prototype.hasOwnProperty(p)) {
                that.prototype[p] = m.prototype[p];
            }
        }
        return that;
    }
    exports.Evented = function() {
        this._morningwood_event_registry = {};
    }
    exports.Evented.prototype.addEventListener = function(type, listener) {
        if (typeof(this._morningwood_event_registry) == 'undefined') {
            throw "morningwood.Evented: no event registry found.";
        }
        if (typeof(listener) == 'function') {
            if (!this._morningwood_event_registry[type]) {
                this._morningwood_event_registry[type] = [];
            }
            this._morningwood_event_registry[type].push(listener);
        }
    }
    exports.Evented.prototype.removeEventListener = function(type, listener) {
        if (this._morningwood_event_registry[type]) {
            for (var l in this._morningwood_event_registry) {
                if (this._morningwood_event_registry[type][l] == listener) {
                    delete this._morningwood_event_registry[type][l];
                }
            }
        }
    }
    exports.Evented.prototype.dispatchEvent = function(e) {
        if (this._morningwood_event_registry[e.type]) {
            for (var l in this._morningwood_event_registry[e.type]) {
                this._morningwood_event_registry[e.type][l](e);
            }
        }
    }

    /* Event class */
    exports.Event = function(type, data) {
        this.type = type;
        this.data = data || null;
    }
})(typeof exports === 'undefined'? this['morningwood']={}: exports);

