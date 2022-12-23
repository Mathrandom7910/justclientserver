import { createInterface, Interface } from "node:readline";
import { FileClass } from "./filec";
import EventEmitter from "@mathrandom7910/tseventemitter";
import { readFile } from "node:fs";

export interface LRMap {
    line: string;
    close: FileClass;
}

/**
 * LineReader object to read a file line by line
 */

export class LineReader extends EventEmitter<LRMap> {
    private rl: Interface | null = null;
    private closed: boolean = false;

    /**
     * Constructs a new LineReader object
     * @param file File to read from
     */

    constructor(private file: FileClass) {
        super();

        this.rl = createInterface(this.file.readStream());
        this.rl.on("line", (line) => {
            if(this.closed) return;
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

/**
 * FReader object to read the entire contents of a file
 */

export class FReader {

    /**
     * Constructs a new FReader object
     * @param file File to read from
     */

    constructor(private file: FileClass) {
    }

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



    read(bufferEncoding?: BufferEncoding): Promise<string | Buffer> {
        return new Promise<Buffer | string>((res, rej) => {
            if (!bufferEncoding) {
                readFile(this.file.path, (err, data) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(data);
                    }
                });
            } else {
                readFile(this.file.path, bufferEncoding, (err, data) => {
                    if (err) {
                        rej(err);
                    } else {
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

    async JSON<K = any>(bufEncoding: BufferEncoding = "utf-8") {
        return JSON.parse(await this.read(bufEncoding)) as K;
    }
}
