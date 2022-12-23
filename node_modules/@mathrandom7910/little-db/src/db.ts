import { FileClass } from "filec"
import { InitOptions } from "./initopts";
import uuid from "uuid-random";

export class DBEntry<T> {
    file!: FileClass;
    data: {
        id: string
    } & T;

    static baseDir: string;
    static dbName: string;

    #df;
    #dfExists: Promise<boolean> | null;
    #iop;
    #oldId: string;

    /**
     * Directory entry name, modifying this WILL cause issues
     */
    #den!: string;

    constructor(iOp: InitOptions, name: string) {
        this.#iop = iOp;
        this.data = {
            id: uuid()
        } as any;

        this.#den = `${iOp.baseDirectory}${name}`;
        const dirFile = new iOp.Filec(this.#den);
        this.#df = dirFile;
        this.#dfExists = dirFile.exists();
        this.#oldId = this.data.id;

        this.setFile();
    }

    setFile() {
        this.file = new this.#iop.Filec(`${this.#den}/${this.data.id}.json`);
    }

    put<K extends keyof T>(key: K, value: T[K]) {
        (this.data as any)[key] = value;
    }

    get<K extends keyof T>(key: K) {
        return this.data[key];
    }

    async save() {
        if(this.#oldId != this.data.id) {
            this.setFile();
        }
        
        await this.#checkExists();
        await this.file.writer().bulkWriter().write(this.#iop.parser.toStorage(this.data));
    }


    async #checkExists() {
        if(this.#dfExists == null) {
            return;
        }
        const existsBool = await this.#dfExists;

        if(existsBool) {
            this.#dfExists = null;
            return;
        }

        await this.#df.mkDirs();
    }

    async delete() {
        this.file.delete();
        return this;
    }
}

export function entry<T, K = Partial<T>>(initOps: InitOptions, name: string, defaultData?: K) {
    var madeDirs = false;
    async function mkDirs() {
        if (madeDirs) return;

        const dir = new initOps.Filec(`${initOps.baseDirectory}${name}`);
        if (!await dir.exists()) {
            await dir.mkDirs();
        }
        madeDirs = true;
    }

    return class extends DBEntry<T> {
        constructor(data?: K) {
            super(initOps, name);

            if (data) {
                for (let i in data) {
                    (this.data as any)[i] = data[i];
                }
            }
        }

        static override baseDir = initOps.baseDirectory;
        static override dbName = name;

        /**
         * Finds an entry by the given id with an o(1) time complexity
         * @param id Id of the entry to find
         * @returns Found entry with the id that matches the given id, or null if none are found
         */

        static async findById(id: string) {
            await mkDirs();
            const file = new initOps.Filec(`${this.baseDir}${this.dbName}/${id}.json`);

            if (!(await file.exists())) {
                return null;
            }

            const parsed = initOps.parser.fromStorage(await file.reader().read("utf-8"));
            const entry = new DBEntry<T>(initOps, name);

            if (defaultData) {
                for (let i in defaultData) {
                    (entry.data as any)[i] = defaultData[i];
                }
            }

            for (let i in parsed) {
                (entry.data as any)[i] = (parsed as any)[i];
            }

            entry.setFile();

            return entry;
        }

        static async iter(cb: (entry: DBEntry<T>, cancel: () => void) => any) {
            await mkDirs();
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new initOps.Filec(fDir);

            const walkRes = await fileDir.walk();

            var cancelled = false;
            function cancel() {
                cancelled = true;
            }

            for(const file of walkRes) {
                const entry = await this.findById(file.split(".json")[0]);
                if(entry == null) continue;
                cb(entry, cancel);
                if(cancelled) break;
            }
        }

        static async all() {
            const entries: DBEntry<T>[] = [];
            await this.iter((entry) => {
                entries.push(entry);
            });
            return entries;
        }

        static async find(propCol: string, val: any, max = 1) {
            const props: string[] = [];
            const entries: DBEntry<T>[] = [];
            var nextEscaped = false;
            var curProp = "";
            for(let i of propCol) {
                if(nextEscaped) {
                    curProp += i;
                    nextEscaped = false;
                    continue;
                }

                if(i == "\\") {
                    nextEscaped = true;
                    continue;
                }

                if(i == ".") {
                    props.push(curProp);
                    curProp = "";
                    continue;
                }

                curProp += i;
            }

            props.push(curProp);

            const allEntries = await this.all();

            
            for(const entry of allEntries) {

                if(entry == null) continue;

                var curProp = props[0];
                var curObj = entry.data as Record<string, any>;
                for(const prop of props) {
                    if(prop.length == 0 || curObj == null) {
                        continue;
                    }
                    curObj = curObj[prop];
                }

                if(curObj == val) {
                    entries.push(entry);
                    if(entries.length >= max) {
                        return entries;
                    }
                }
            }

            return entries;
        }

        static async findOne(propCol: string, val: any): Promise<DBEntry<T> | null> {
            return (await this.find(propCol, val, 1))[0] || null;
        }

        static async findOneAndDelete(propCol: string, val: any) {
            return (await this.findOne(propCol, val))?.delete();
        }

        static async findAndDelete(propCol: string, val: any) {
            const all = await this.find(propCol, val);
            const entries: DBEntry<T>[] = [];
            for(const entry of all) {
                entries.push(await entry.delete());
            }
            return entries;
        }
    }
}

