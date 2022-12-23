"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileClass = void 0;
const node_fs_1 = require("node:fs");
const reader_1 = require("./reader");
const node_path_1 = require("node:path");
const writer_1 = require("./writer");
/**
 * Interface to interact with the file system easily
 */
class FileClass {
    path;
    /**
     * Constructs the file object
     * @param path Path of the file/directory to wrap
     */
    constructor(path) {
        this.path = path;
    }
    /**
     * Asynchronously tests access on the current file
     * @param mode Mode to test access with
     * @returns True if the access passes, otherwise false
     */
    access(mode) {
        return new Promise((res) => {
            (0, node_fs_1.access)(this.path, mode, (er) => {
                if (er) {
                    res(false);
                }
                else {
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
        return this.access(node_fs_1.constants.F_OK);
    }
    /**
     * Asynchronously gets the stats on the path
     * @returns Stats on the path
     */
    stats() {
        return new Promise((res, rej) => {
            (0, node_fs_1.lstat)(this.path, (er, stats) => {
                if (er)
                    rej(er);
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
     * @param encoding Optional encoding method
     * @returns An array (string) of sub-directories and files
     */
    async walk(encoding = "utf-8") {
        return new Promise(async (res, rej) => {
            if (!await this.isDir()) {
                rej(`${this.path} is NOT a directory!`);
            }
            if (encoding) {
                (0, node_fs_1.readdir)(this.path, encoding, (er, files) => {
                    if (er)
                        rej(er);
                    res(files);
                });
            }
        });
    }
    /**
     * Creates a new FReader object
     * @returns The newly created FReader object
     */
    reader() {
        return new reader_1.FReader(this);
    }
    /**
     * Creates a new FWriter object
     * @returns The newly created FWriter object
     */
    writer() {
        return new writer_1.FWriter(this);
    }
    /**
     * Creates a readstream on the current file
     * @param encoding Type of encoding to open the readstream with
     * @returns The created readstream
     */
    readStream(encoding = "utf-8") {
        return (0, node_fs_1.createReadStream)(this.path, { encoding });
    }
    #mkDir(path) {
        return new Promise((res, rej) => {
            (0, node_fs_1.mkdir)(path, (e) => {
                if (e)
                    rej(e);
                res();
            });
        });
    }
    /**
     * Asynchronously makes the directory specified
     */
    async mkDir() {
        if (await this.exists()) {
            return;
        }
        await this.#mkDir(this.path).catch(console.log);
        return;
    }
    /**
     * Asynchronously makes the directories specified
     */
    async mkDirs() {
        const dirs = (0, node_path_1.resolve)(this.path).split(node_path_1.sep);
        var concatDir = "";
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            concatDir += dir + (dirs.length - 1 == i ? "" : node_path_1.sep);
            await new FileClass(concatDir).mkDir();
        }
    }
    /**
     * Asynchronously deletes the current file
     */
    delete() {
        return new Promise((res, rej) => {
            (0, node_fs_1.unlink)(this.path, (e) => {
                if (e)
                    rej(e);
                res();
            });
        });
    }
    /**
     * Asynchronously opens the current file
     * @param mode Mode to open the current file with
     * @returns The file descriptor
     */
    open(mode) {
        return new Promise((res, rej) => {
            (0, node_fs_1.open)(this.path, mode, (e, fd) => {
                if (e)
                    rej(e);
                res(fd);
            });
        });
    }
    /**
     * Asynchronously closes the current file
     * @param fd File descriptor of which file to close
     */
    close(fd) {
        return new Promise((res, rej) => {
            (0, node_fs_1.close)(fd, (e) => {
                if (e)
                    rej(e);
                res();
            });
        });
    }
    /**
     * Asynchronously creates a file if it doesn't currently exist
     * @returns True if the file already exists, otherwise creates the file and returns false
     */
    async create() {
        if (await this.exists()) {
            return true;
        }
        const fd = await this.open("w");
        await this.close(fd);
        return false;
    }
}
exports.FileClass = FileClass;
