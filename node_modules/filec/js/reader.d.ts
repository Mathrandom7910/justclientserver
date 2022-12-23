/// <reference types="node" />
import { FileClass } from "./filec";
import EventEmitter from "@mathrandom7910/tseventemitter";
export interface LRMap {
    line: string;
    close: FileClass;
}
/**
 * LineReader object to read a file line by line
 */
export declare class LineReader extends EventEmitter<LRMap> {
    private file;
    private rl;
    private closed;
    /**
     * Constructs a new LineReader object
     * @param file File to read from
     */
    constructor(file: FileClass);
    /**
     * Closes the readline interface and prevents any line events from emitting
     */
    close(): void;
}
/**
 * FReader object to read the entire contents of a file
 */
export declare class FReader {
    private file;
    /**
     * Constructs a new FReader object
     * @param file File to read from
     */
    constructor(file: FileClass);
    /**
     * Reads the entire file with the specified encoding options
     * @param bufferEncoding Buffer encoding options to read the file with
     * @returns String encoded from the option
     */
    read(bufferEncoding: BufferEncoding): Promise<string>;
    /**
     * Reads the entire file with no buffer encoding options
     * @returns The raw buffer from the file
     */
    read(): Promise<Buffer>;
    /**
     * Creates and returns a new LineReader object
     * @returns The newly created LineReader object
     */
    readLine(): LineReader;
    /**
     * Reads the current file and parses the output with JSON
     * @returns The parsed output, specified by the generic, or any
     */
    JSON<K = any>(bufEncoding?: BufferEncoding): Promise<K>;
}
