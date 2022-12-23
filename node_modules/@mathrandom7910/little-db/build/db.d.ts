import { FileClass } from "filec";
import { InitOptions } from "./initopts";
export declare class DBEntry<T> {
    #private;
    file: FileClass;
    data: {
        id: string;
    } & T;
    static baseDir: string;
    static dbName: string;
    constructor(iOp: InitOptions, name: string);
    setFile(): void;
    put<K extends keyof T>(key: K, value: T[K]): void;
    get<K extends keyof T>(key: K): ({
        id: string;
    } & T)[K];
    save(): Promise<void>;
    delete(): Promise<this>;
}
export declare function entry<T, K = Partial<T>>(initOps: InitOptions, name: string, defaultData?: K): {
    new (data?: K): {
        file: FileClass;
        data: {
            id: string;
        } & T;
        "__#2@#df": FileClass;
        "__#2@#dfExists": Promise<boolean> | null;
        "__#2@#iop": InitOptions;
        "__#2@#oldId": string;
        /**
         * Directory entry name, modifying this WILL cause issues
         */
        "__#2@#den": string;
        setFile(): void;
        put<K_1 extends keyof T>(key: K_1, value: T[K_1]): void;
        get<K_2 extends keyof T>(key: K_2): ({
            id: string;
        } & T)[K_2];
        save(): Promise<void>;
        "__#2@#checkExists"(): Promise<void>;
        delete(): Promise<any>;
    };
    baseDir: string;
    dbName: string;
    /**
     * Finds an entry by the given id with an o(1) time complexity
     * @param id Id of the entry to find
     * @returns Found entry with the id that matches the given id, or null if none are found
     */
    findById(id: string): Promise<DBEntry<T> | null>;
    iter(cb: (entry: DBEntry<T>, cancel: () => void) => any): Promise<void>;
    all(): Promise<DBEntry<T>[]>;
    find(propCol: string, val: any, max?: number): Promise<DBEntry<T>[]>;
    findOne(propCol: string, val: any): Promise<DBEntry<T> | null>;
    findOneAndDelete(propCol: string, val: any): Promise<DBEntry<T> | undefined>;
    findAndDelete(propCol: string, val: any): Promise<DBEntry<T>[]>;
};
