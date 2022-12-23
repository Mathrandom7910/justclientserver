import { DBEntry } from "./db";

export class DBConfig<T> {
    constructor(private entry: DBEntry<T>) {

    }

    save() {
        return this.entry.save();
    }

    get data() {
        return this.entry.data;
    }
}