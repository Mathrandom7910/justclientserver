"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBConfig = void 0;
class DBConfig {
    entry;
    constructor(entry) {
        this.entry = entry;
    }
    save() {
        return this.entry.save();
    }
    get data() {
        return this.entry.data;
    }
}
exports.DBConfig = DBConfig;
//# sourceMappingURL=dbconfig.js.map