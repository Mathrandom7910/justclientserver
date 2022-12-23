import { DBEntry } from "./db";
export declare class DBConfig<T> {
    private entry;
    constructor(entry: DBEntry<T>);
    save(): Promise<void>;
    get data(): {
        id: string;
    } & T;
}
