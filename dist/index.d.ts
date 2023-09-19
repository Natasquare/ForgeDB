import { ForgeClient, ForgeExtension } from "forgescript";
import { QuickDB, SqliteDriver, MongoDriver } from "quick.db";
export declare type QuickDBTable = QuickDB<IQuickDBData>;
export interface IQuickDBData {
    identifier: string;
    id: string;
    type: string;
    value: string;
}
export declare enum DriverType {
    Sqlite = "sqlite",
    Mongo = "mongo"
}
export declare type ForgeDBOptions = {
    type: DriverType.Sqlite;
    path: string;
} | {
    type: DriverType.Mongo;
    mongoURL: string;
};
export declare class ForgeDB extends ForgeExtension {
    readonly options: ForgeDBOptions;
    static db: QuickDBTable;
    static driver: SqliteDriver | MongoDriver;
    name: string;
    description: string;
    version: string;
    constructor(options?: ForgeDBOptions);
    init(client: ForgeClient): void;
    static setDriver(client: ForgeClient, options: ForgeDBOptions): Promise<void>;
    static makeIdentifier(type: string, id: string): string;
    static get(type: string, id: string): Promise<IQuickDBData | null>;
    static set(type: string, id: string, value: string): Promise<{
        identifier: string;
        id: string;
        type: string;
        value: string;
    }>;
    static delete(type: string, id: string): Promise<number>;
    static allWithType(type: string): Promise<IQuickDBData[]>;
    static all(filter?: (row: IQuickDBData) => boolean): Promise<IQuickDBData[]>;
    static deleteWithFilter(filter: (row: IQuickDBData) => boolean): Promise<number[]>;
    static deleteAll(): Promise<number>;
}
//# sourceMappingURL=index.d.ts.map