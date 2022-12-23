import { AbstractParser } from "@mathrandom7910/little-db";
import { AES, enc } from "crypto-js";
import { key } from "./key";

export class EncryptionParser implements AbstractParser {
    toStorage(data: {}): string | Buffer {
        return AES.encrypt(JSON.stringify(data), key).toString();
    }

    fromStorage(data: string | Buffer): {} {
        if (typeof data != "string") {
            data = data.toString("utf-8");
        }

        return JSON.parse(AES.decrypt(data, key).toString(enc.Utf8));
    }
}
