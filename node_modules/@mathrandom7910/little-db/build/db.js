"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entry = exports.DBEntry = void 0;
const uuid_random_1 = __importDefault(require("uuid-random"));
class DBEntry {
    file;
    data;
    static baseDir;
    static dbName;
    #df;
    #dfExists;
    #iop;
    #oldId;
    /**
     * Directory entry name, modifying this WILL cause issues
     */
    #den;
    constructor(iOp, name) {
        this.#iop = iOp;
        this.data = {
            id: (0, uuid_random_1.default)()
        };
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
    put(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key];
    }
    async save() {
        if (this.#oldId != this.data.id) {
            this.setFile();
        }
        await this.#checkExists();
        await this.file.writer().bulkWriter().write(this.#iop.parser.toStorage(this.data));
    }
    async #checkExists() {
        if (this.#dfExists == null) {
            return;
        }
        const existsBool = await this.#dfExists;
        if (existsBool) {
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
exports.DBEntry = DBEntry;
function entry(initOps, name, defaultData) {
    var madeDirs = false;
    async function mkDirs() {
        if (madeDirs)
            return;
        const dir = new initOps.Filec(`${initOps.baseDirectory}${name}`);
        if (!await dir.exists()) {
            await dir.mkDirs();
        }
        madeDirs = true;
    }
    return class extends DBEntry {
        constructor(data) {
            super(initOps, name);
            if (data) {
                for (let i in data) {
                    this.data[i] = data[i];
                }
            }
        }
        static baseDir = initOps.baseDirectory;
        static dbName = name;
        /**
         * Finds an entry by the given id with an o(1) time complexity
         * @param id Id of the entry to find
         * @returns Found entry with the id that matches the given id, or null if none are found
         */
        static async findById(id) {
            await mkDirs();
            const file = new initOps.Filec(`${this.baseDir}${this.dbName}/${id}.json`);
            if (!(await file.exists())) {
                return null;
            }
            const parsed = initOps.parser.fromStorage(await file.reader().read("utf-8"));
            const entry = new DBEntry(initOps, name);
            if (defaultData) {
                for (let i in defaultData) {
                    entry.data[i] = defaultData[i];
                }
            }
            for (let i in parsed) {
                entry.data[i] = parsed[i];
            }
            entry.setFile();
            return entry;
        }
        static async iter(cb) {
            await mkDirs();
            const fDir = `${this.baseDir}${this.dbName}/`;
            const fileDir = new initOps.Filec(fDir);
            const walkRes = await fileDir.walk();
            var cancelled = false;
            function cancel() {
                cancelled = true;
            }
            for (const file of walkRes) {
                const entry = await this.findById(file.split(".json")[0]);
                if (entry == null)
                    continue;
                cb(entry, cancel);
                if (cancelled)
                    break;
            }
        }
        static async all() {
            const entries = [];
            await this.iter((entry) => {
                entries.push(entry);
            });
            return entries;
        }
        static async find(propCol, val, max = 1) {
            const props = [];
            const entries = [];
            var nextEscaped = false;
            var curProp = "";
            for (let i of propCol) {
                if (nextEscaped) {
                    curProp += i;
                    nextEscaped = false;
                    continue;
                }
                if (i == "\\") {
                    nextEscaped = true;
                    continue;
                }
                if (i == ".") {
                    props.push(curProp);
                    curProp = "";
                    continue;
                }
                curProp += i;
            }
            props.push(curProp);
            const allEntries = await this.all();
            for (const entry of allEntries) {
                if (entry == null)
                    continue;
                var curProp = props[0];
                var curObj = entry.data;
                for (const prop of props) {
                    if (prop.length == 0 || curObj == null) {
                        continue;
                    }
                    curObj = curObj[prop];
                }
                if (curObj == val) {
                    entries.push(entry);
                    if (entries.length >= max) {
                        return entries;
                    }
                }
            }
            return entries;
        }
        static async findOne(propCol, val) {
            return (await this.find(propCol, val, 1))[0] || null;
        }
        static async findOneAndDelete(propCol, val) {
            return (await this.findOne(propCol, val))?.delete();
        }
        static async findAndDelete(propCol, val) {
            const all = await this.find(propCol, val);
            const entries = [];
            for (const entry of all) {
                entries.push(await entry.delete());
            }
            return entries;
        }
    };
}
exports.entry = entry;
//# sourceMappingURL=db.js.map