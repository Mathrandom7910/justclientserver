"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultParser = exports.AbstractParser = void 0;
class AbstractParser {
}
exports.AbstractParser = AbstractParser;
class DefaultParser {
    toStorage(data) {
        return JSON.stringify(data);
    }
    fromStorage(data) {
        return JSON.parse(data);
    }
}
exports.DefaultParser = DefaultParser;
//# sourceMappingURL=parser.js.map