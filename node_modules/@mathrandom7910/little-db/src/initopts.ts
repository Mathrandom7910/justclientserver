import { FileClass } from "filec";
import { AbstractParser } from "./parser/parser";

export interface InitOptions {
    /**
     * The base directory for data to be stored
     */
    baseDirectory: string;

    parser: AbstractParser;

    Filec: typeof FileClass;
}
