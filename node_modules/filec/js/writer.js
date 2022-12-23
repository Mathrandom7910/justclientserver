"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FWriter = exports.BulkFileWriter = exports.FileAppender = void 0;
const node_fs_1 = require("node:fs");
/**
 * Object to apped data to files
 */
class FileAppender {
    path;
    /**
     * Constructs a FileAppender object
     * @param path Path to the file
     */
    constructor(path) {
        this.path = path;
    }
    append(data) {
        return new Promise((res, rej) => {
            (0, node_fs_1.appendFile)(this.path, data, (e) => {
                if (e)
                    rej(e);
                res();
            });
        });
    }
}
exports.FileAppender = FileAppender;
/**
 * Bulk file writer object
 */
class BulkFileWriter {
    path;
    /**
     * Constructs a BulkFileWriter object
     * @param path Path of the file to write to
     */
    constructor(path) {
        this.path = path;
    }
    /**
     * Asynchronously replaces the file with the data provided
     * @param data Data to replace the current file with
     */
    write(data) {
        return new Promise((res, rej) => {
            (0, node_fs_1.writeFile)(this.path, data, (e) => {
                if (e)
                    rej(e);
                res();
            });
        });
    }
}
exports.BulkFileWriter = BulkFileWriter;
/**
 * Object to access different methods of writing to files
 */
class FWriter {
    file;
    constructor(file) {
        this.file = file;
    }
    /**
     * Creates and returns a new FileAppender object
     * @returns The newly created FileAppender object
     */
    appender() {
        return new FileAppender(this.file.path);
    }
    /**
     * Creates and returns a new BulkFileWriter object
     * @returns The newly created BulkFileWriter object
     */
    bulkWriter() {
        return new BulkFileWriter(this.file.path);
    }
}
exports.FWriter = FWriter;
