import { FileClass } from "./filec";
import { appendFile, writeFile } from "node:fs";

/**
 * Object to apped data to files
 */

export class FileAppender {

    /**
     * Constructs a FileAppender object
     * @param path Path to the file
     */

    constructor(private path: string) {
    }

    /**
     * Asynchronously appends bytes to the file
     * @param bytes The bytes to append to the file
     */

    append(bytes: Uint8Array): Promise<void>;

    /**
     * Asynchronously appends a string to the file
     * @param str The string to append to the file
     */

    append(str: string): Promise<void>;

    append(data: string | Uint8Array) {
        return new Promise<void>((res, rej) => {
            appendFile(this.path, data, (e) => {
                if(e) rej(e);
                res();
            });
        });
    }
}

/**
 * Bulk file writer object
 */

export class BulkFileWriter {

    /**
     * Constructs a BulkFileWriter object
     * @param path Path of the file to write to 
     */
    constructor(private path: string) {

    }

    /**
     * Asynchronously replaces the file with the data provided
     * @param data Data to replace the current file with
     */

    write(data: string | Buffer) {
        return new Promise<void>((res, rej) => {
            writeFile(this.path, data, (e) => {
                if(e) rej(e);
                res();
            });
        });
    }
}

/**
 * Object to access different methods of writing to files
 */

export class FWriter {
    constructor(private file: FileClass) {

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
        return new BulkFileWriter(this.file.path)
    }
}