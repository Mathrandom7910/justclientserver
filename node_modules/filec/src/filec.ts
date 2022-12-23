import { access, constants, createReadStream, mkdir, unlink, open, close, lstat, Stats, readdir } from 'node:fs';
import { FReader } from './reader';
import { resolve, sep } from "node:path";
import { FWriter } from './writer';

/**
 * Interface to interact with the file system easily
 */

export class FileClass {

    /**
     * Constructs the file object
     * @param path Path of the file/directory to wrap
     */

    constructor(readonly path: string) {

    }
    
    /**
     * Asynchronously tests access on the current file
     * @param mode Mode to test access with
     * @returns True if the access passes, otherwise false
     */

    access(mode: number) {
        return new Promise<boolean>((res) => {
            access(this.path, mode, (er) => {
                if (er) {
                    res(false);
                } else {
                    res(true);
                }
            });
        });
    }

    /**
     * Asynchronously checks if the current file exists
     * @returns True if the file exists, otherwise false
     */

    async exists() {
        return this.access(constants.F_OK);
    }

    /**
     * Asynchronously gets the stats on the path
     * @returns Stats on the path
     */

    stats() {
        return new Promise<Stats>((res, rej) => {
            lstat(this.path, (er, stats) => {
                if(er) rej(er);

                res(stats);
            });
        });
    }

    /**
     * Asynchronously checks if the current Object is a directory or a file, requires the file/directory to exist
     * @returns True if the object is a directory, otherwise false.
     */

    async isDir() {
        return (await this.stats()).isDirectory();
    }

    /**
     * Walks over a directory to find all files, and sub-directories
     * @param encoding Encoding method to walk by
     * @returns An array (string) of sub-directories and files
     */

    async walk(encoding: BufferEncoding): Promise<string[]>;

    /**
     * Walks over a directory to find all files, and sub-directories defaulting to a BufferEncoding of `utf-8` 
     * @returns An array (string) of sub-directories and files
     */

    async walk(): Promise<string[]>;

    /**
     * Walks over a directory to find all files, and sub-directories
     * @param encoding Optional encoding method
     * @returns An array (string) of sub-directories and files
     */

    async walk(encoding: BufferEncoding = "utf-8") {
        return new Promise<string[]>(async (res, rej) => {
            if(!await this.isDir()) {
                rej(`${this.path} is NOT a directory!`)
            }
    
            if(encoding) {
                readdir(this.path, encoding, (er, files) => {
                    if(er) rej(er);

                    res(files);
                });
            }
        })
    }

    /**
     * Creates a new FReader object
     * @returns The newly created FReader object
     */

    reader() {
        return new FReader(this);
    }

    /**
     * Creates a new FWriter object
     * @returns The newly created FWriter object
     */

    writer() {
        return new FWriter(this);
    }

    /**
     * Creates a readstream on the current file
     * @param encoding Type of encoding to open the readstream with
     * @returns The created readstream
     */

    readStream(encoding: BufferEncoding = "utf-8") {
        return createReadStream(this.path, { encoding });
    }

    #mkDir(path: string) {
        return new Promise<void>((res, rej) => {
            mkdir(path, (e) => {
                if(e) rej(e);
                res();
            });
        });
    }

    /**
     * Asynchronously makes the directory specified
     */

    async mkDir() {
        if(await this.exists()) {
            return;
        }
        await this.#mkDir(this.path).catch(console.log);

        return;
    }

    /**
     * Asynchronously makes the directories specified
     */

    async mkDirs() {
        const dirs = resolve(this.path).split(sep);

        var concatDir: string = "";
        for(let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            concatDir += dir + (dirs.length - 1 == i ? "" : sep);

            await new FileClass(concatDir).mkDir();
        }
    }

    /**
     * Asynchronously deletes the current file
     */

    delete() {
        return new Promise<void>((res, rej) => {
            unlink(this.path, (e) => {
                if(e) rej(e);
                res();
            });
        });
    }

    /**
     * Asynchronously opens the current file
     * @param mode Mode to open the current file with
     * @returns The file descriptor
     */

    open(mode: string) {
        return new Promise<number>((res, rej) => {
            open(this.path, mode, (e, fd) => {
                if(e) rej(e);
                res(fd);
            });
        });
    }

    /**
     * Asynchronously closes the current file
     * @param fd File descriptor of which file to close
     */

    close(fd: number) {
        return new Promise<void>((res, rej) => {
            close(fd, (e) => {
                if(e) rej(e);
                res();
            });
        });
    }

    /**
     * Asynchronously creates a file if it doesn't currently exist
     * @returns True if the file already exists, otherwise creates the file and returns false 
     */

    async create() {
        if(await this.exists()) {
            return true;
        }

        const fd = await this.open("w");

        await this.close(fd);

        return false;
    }
}