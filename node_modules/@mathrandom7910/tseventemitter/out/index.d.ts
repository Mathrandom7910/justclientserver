declare class EventEmitter<Map = any> {
    private events;
    /**
     * Registers an event that will be called when emit with the same type is called.
     * @param type Type of event to register to.
     * @param cb Callback function that is called when the given event is emitted.
     * @param once Determines if the event should only be called once
     * @returns The callback function.
     */
    on<K extends keyof Map>(type: K, cb: (event: Map[K]) => any, once?: boolean): (event: Map[K]) => any;
    /**
     * Registers an event that will be called once when emit with the same type is called.
     * @param type Type of event to register to.
     * @param cb Callback function that is called when the given event is emitted.
     * @returns The callback function.
     */
    once<K extends keyof Map>(type: K, cb: (event: Map[K]) => any): (event: Map[K]) => any;
    /**
     * Emits an event to all registered events.
     * @param type Type of event to emit.
     * @param arg Event argument to emit.
     */
    emit<K extends keyof Map>(type: K, arg: Map[K]): void;
    /**
     * "Unregisters" an event - doesn't prevent from event being called again, event will only be called once after this method is called.
     * @param type Type of event to unregister.
     * @param cb Callback of the event type to unregister
     */
    off<K extends keyof Map>(type: K, cb: Function): void;
    /**
     * Creates a promise that is resolved once the specified event is emitted.
     * @param type Type of event to wait for.
     * @returns Promise that is resolved once the specified event is emitted.
     */
    wait<K extends keyof Map>(type: K): Promise<Map[K]>;
}
export = EventEmitter;
//# sourceMappingURL=index.d.ts.map