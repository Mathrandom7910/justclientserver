export interface IParser {
    toStorage(data: {}): string | Buffer;

    fromStorage(data: string): {};
}

export abstract class AbstractParser implements IParser {
    abstract toStorage(data: {}): string | Buffer;
    abstract fromStorage(data: string | Buffer): {};
}

export class DefaultParser implements IParser {
    toStorage(data: {}): string | Buffer {
        return JSON.stringify(data);
    }

    fromStorage(data: string): {} {
        return JSON.parse(data);
    }
}