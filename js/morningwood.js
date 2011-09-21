/** event-emitter.js

    Provide basic event listening/dispatching

    Konrad Markus <konker@gmail.com>
*/

if (typeof(morningwood) != 'object') {
    var morningwood = {};
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
morningwood.Evented = function() {
    this._morningwood_event_registry = {};
}
morningwood.Evented.prototype.addEventListener = function(type, listener) {
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
morningwood.Evented.prototype.removeEventListener = function(type, listener) {
    if (this._morningwood_event_registry[type]) {
        for (var l in this._morningwood_event_registry) {
            if (this._morningwood_event_registry[type][l] == listener) {
                delete this._morningwood_event_registry[type][l];
            }
        }
    }
}
morningwood.Evented.prototype.dispatchEvent = function(e) {
    if (this._morningwood_event_registry[e.type]) {
        for (var l in this._morningwood_event_registry[e.type]) {
            this._morningwood_event_registry[e.type][l](e);
        }
    }
}

/* Event class */
morningwood.Event = function(type, data) {
    this.type = type;
    this.data = data || null;
}

