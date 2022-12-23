/// <reference types="node" />
import { FileClass } from "./filec";
/**
 * Object to apped data to files
 */
export declare class FileAppender {
    private path;
    /**
     * Constructs a FileAppender object
     * @param path Path to the file
     */
    constructor(path: string);
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
}
/**
 * Bulk file writer object
 */
export declare class BulkFileWriter {
    private path;
    /**
     * Constructs a BulkFileWriter object
     * @param path Path of the file to write to
     */
    constructor(path: string);
    /**
     * Asynchronously replaces the file with the data provided
     * @param data Data to replace the current file with
     */
    write(data: string | Buffer): Promise<void>;
}
/**
 * Object to access different methods of writing to files
 */
export declare class FWriter {
    private file;
    constructor(file: FileClass);
    /**
     * Creates and returns a new FileAppender object
     * @returns The newly created FileAppender object
     */
    appender(): FileAppender;
    /**
     * Creates and returns a new BulkFileWriter object
     * @returns The newly created BulkFileWriter object
     */
    bulkWriter(): BulkFileWriter;
}
