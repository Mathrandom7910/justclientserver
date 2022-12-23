"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionParser = void 0;
const crypto_js_1 = require("crypto-js");
const key_1 = require("./key");
class EncryptionParser {
    toStorage(data) {
        return crypto_js_1.AES.encrypt(JSON.stringify(data), key_1.key).toString();
    }
    fromStorage(data) {
        if (typeof data != "string") {
            data = data.toString("utf-8");
        }
        return JSON.parse(crypto_js_1.AES.decrypt(data, key_1.key).toString(crypto_js_1.enc.Utf8));
    }
}
exports.EncryptionParser = EncryptionParser;
