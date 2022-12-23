"use strict";
class EventData {
    name;
    cb;
    once;
    constructor(name, cb, once = false) {
        this.name = name;
        this.cb = cb;
        this.once = once;
    }
}
class EventEmitter {
    events = {};
    /**
     * Registers an event that will be called when emit with the same type is called.
     * @param type Type of event to register to.
     * @param cb Callback function that is called when the given event is emitted.
     * @param once Determines if the event should only be called once
     * @returns The callback function.
     */
    on(type, cb, once = false) {
        if (!this.events[type])
            this.events[type] = [];
        this.events[type].push(new EventData(type, cb, once));
        return cb;
    }
    /**
     * Registers an event that will be called once when emit with the same type is called.
     * @param type Type of event to register to.
     * @param cb Callback function that is called when the given event is emitted.
     * @returns The callback function.
     */
    once(type, cb) {
        return this.on(type, cb, true);
    }
    /**
     * Emits an event to all registered events.
     * @param type Type of event to emit.
     * @param arg Event argument to emit.
     */
    emit(type, arg) {
        if (!this.events[type])
            return;
        for (let i = 0; i < this.events[type].length; i++) {
            const evt = this.events[type][i];
            if (evt.name != type)
                continue;
            evt.cb(arg);
            if (evt.once) {
                this.events[type].splice(i, 1);
                i--;
            }
        }
    }
    /**
     * "Unregisters" an event - doesn't prevent from event being called again, event will only be called once after this method is called.
     * @param type Type of event to unregister.
     * @param cb Callback of the event type to unregister
     */
    off(type, cb) {
        for (const e of this.events[type]) {
            if (e.name == type && e.cb == cb) {
                e.once = true;
            }
        }
    }
    /**
     * Creates a promise that is resolved once the specified event is emitted.
     * @param type Type of event to wait for.
     * @returns Promise that is resolved once the specified event is emitted.
     */
    wait(type) {
        return new Promise((res) => {
            const fn = (e) => {
                res(e);
            };
            this.on(type, fn);
            this.off(type, fn);
        });
    }
}
module.exports = EventEmitter;
