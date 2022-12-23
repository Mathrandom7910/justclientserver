"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const tseventemitter_1 = __importDefault(require("@mathrandom7910/tseventemitter"));
const filec_1 = require("filec");
const db_1 = require("./db");
const dbconfig_1 = require("./dbconfig");
const parser_1 = require("./parser/parser");
class InitResult extends tseventemitter_1.default {
    opts;
    dbCfg = null;
    constructor(opts) {
        super();
        this.opts = opts;
    }
    /**
     * Creates an entry. `Note that the object properties aren't known at runtime, therefore they will be undefined when the entry is first created (unless default data is given).`
     * @param name Name of the Entry to return, this is how it will appear in the local directory.
     * @param defaultData
     * @returns
     */
    entry(name, defaultData) {
        return (0, db_1.entry)(this.opts, name, defaultData);
    }
    async config(defaultData) {
        if (this.dbCfg)
            return this.dbCfg;
        const Config = this.entry("little-db-config", defaultData);
        const defaultIdCfg = await Config.findById("cfg");
        if (defaultIdCfg == null) {
            const cfg = new Config();
            cfg.data.id = "cfg";
            await cfg.save();
            return this.dbCfg = new dbconfig_1.DBConfig(cfg);
        }
        return this.dbCfg = new dbconfig_1.DBConfig(defaultIdCfg);
    }
}
/**
 * Initialization function. `Note this function should only be called once`.
 * @param options Options to initialize.
 * @returns Initialization result with methods to manage the database.
 */
function init(options) {
    options ??= {};
    if (!options.baseDirectory) {
        options.baseDirectory = "./little-db/data/";
    }
    if (!options.baseDirectory.endsWith("/") && !options.baseDirectory.endsWith("\\")) {
        options.baseDirectory += "/";
    }
    if (!options.parser) {
        options.parser = new parser_1.DefaultParser();
    }
    if (!options.Filec) {
        options.Filec = filec_1.FileClass;
    }
    const baseDir = new filec_1.FileClass(options.baseDirectory);
    baseDir
        .exists()
        .then(async (exists) => {
        if (!exists) {
            await baseDir.mkDirs();
        }
        ir.emit("ready", ir);
    });
    const ir = new InitResult(options);
    ir.entry = ir.entry.bind(ir);
    return ir;
}
exports.init = init;
//# sourceMappingURL=init.js.map