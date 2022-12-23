"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FReader = exports.LineReader = void 0;
const node_readline_1 = require("node:readline");
const tseventemitter_1 = __importDefault(require("@mathrandom7910/tseventemitter"));
const node_fs_1 = require("node:fs");
/**
 * LineReader object to read a file line by line
 */
class LineReader extends tseventemitter_1.default {
    file;
    rl = null;
    closed = false;
    /**
     * Constructs a new LineReader object
     * @param file File to read from
     */
    constructor(file) {
        super();
        this.file = file;
        this.rl = (0, node_readline_1.createInterface)(this.file.readStream());
        this.rl.on("line", (line) => {
            if (this.closed)
                return;
            this.emit("line", line);
        });
        this.rl.on("close", () => {
            this.emit("close", this.file);
        });
    }
    /**
     * Closes the readline interface and prevents any line events from emitting
     */
    close() {
        this.rl?.close();
        this.closed = true;
    }
}
exports.LineReader = LineReader;
/**
 * FReader object to read the entire contents of a file
 */
class FReader {
    file;
    /**
     * Constructs a new FReader object
     * @param file File to read from
     */
    constructor(file) {
        this.file = file;
    }
    read(bufferEncoding) {
        return new Promise((res, rej) => {
            if (!bufferEncoding) {
                (0, node_fs_1.readFile)(this.file.path, (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            }
            else {
                (0, node_fs_1.readFile)(this.file.path, bufferEncoding, (err, data) => {
                    if (err) {
                        rej(err);
                    }
                    else {
                        res(data);
                    }
                });
            }
        });
    }
    /**
     * Creates and returns a new LineReader object
     * @returns The newly created LineReader object
     */
    readLine() {
        return new LineReader(this.file);
    }
    /**
     * Reads the current file and parses the output with JSON
     * @returns The parsed output, specified by the generic, or any
     */
    async JSON(bufEncoding = "utf-8") {
        return JSON.parse(await this.read(bufEncoding));
    }
}
exports.FReader = FReader;
