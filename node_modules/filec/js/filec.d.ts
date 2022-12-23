/// <reference types="node" />
/// <reference types="node" />
import { Stats } from 'node:fs';
import { FReader } from './reader';
import { FWriter } from './writer';
/**
 * Interface to interact with the file system easily
 */
export declare class FileClass {
    #private;
    readonly path: string;
    /**
     * Constructs the file object
     * @param path Path of the file/directory to wrap
     */
    constructor(path: string);
    /**
     * Asynchronously tests access on the current file
     * @param mode Mode to test access with
     * @returns True if the access passes, otherwise false
     */
    access(mode: number): Promise<boolean>;
    /**
     * Asynchronously checks if the current file exists
     * @returns True if the file exists, otherwise false
     */
    exists(): Promise<boolean>;
    /**
     * Asynchronously gets the stats on the path
     * @returns Stats on the path
     */
    stats(): Promise<Stats>;
    /**
     * Asynchronously checks if the current Object is a directory or a file, requires the file/directory to exist
     * @returns True if the object is a directory, otherwise false.
     */
    isDir(): Promise<boolean>;
    /**
     * Walks over a directory to find all files, and sub-directories
     * @param encoding Encoding method to walk by
     * @returns An array (string) of sub-directories and files
     */
    walk(encoding: BufferEncoding): Promise<string[]>;
    /**
     * Walks over a directory to find all files, and sub-directories defaulting to a BufferEncoding of `utf-8`
     * @returns An array (string) of sub-directories and files
     */
    walk(): Promise<string[]>;
    /**
     * Creates a new FReader object
     * @returns The newly created FReader object
     */
    reader(): FReader;
    /**
     * Creates a new FWriter object
     * @returns The newly created FWriter object
     */
    writer(): FWriter;
    /**
     * Creates a readstream on the current file
     * @param encoding Type of encoding to open the readstream with
     * @returns The created readstream
     */
    readStream(encoding?: BufferEncoding): import("fs").ReadStream;
    /**
     * Asynchronously makes the directory specified
     */
    mkDir(): Promise<void>;
    /**
     * Asynchronously makes the directories specified
     */
    mkDirs(): Promise<void>;
    /**
     * Asynchronously deletes the current file
     */
    delete(): Promise<void>;
    /**
     * Asynchronously opens the current file
     * @param mode Mode to open the current file with
     * @returns The file descriptor
     */
    open(mode: string): Promise<number>;
    /**
     * Asynchronously closes the current file
     * @param fd File descriptor of which file to close
     */
    close(fd: number): Promise<void>;
    /**
     * Asynchronously creates a file if it doesn't currently exist
     * @returns True if the file already exists, otherwise creates the file and returns false
     */
    create(): Promise<boolean>;
}
