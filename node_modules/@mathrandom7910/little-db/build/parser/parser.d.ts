/// <reference types="node" />
export interface IParser {
    toStorage(data: {}): string | Buffer;
    fromStorage(data: string): {};
}
export declare abstract class AbstractParser implements IParser {
    abstract toStorage(data: {}): string | Buffer;
    abstract fromStorage(data: string | Buffer): {};
}
export declare class DefaultParser implements IParser {
    toStorage(data: {}): string | Buffer;
    fromStorage(data: string): {};
}
