"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeDB = exports.DriverType = void 0;
const forgescript_1 = require("forgescript");
const quick_db_1 = require("quick.db");
var DriverType;
(function (DriverType) {
    DriverType["Sqlite"] = "sqlite";
    DriverType["Mongo"] = "mongo";
})(DriverType = exports.DriverType || (exports.DriverType = {}));
class ForgeDB extends forgescript_1.ForgeExtension {
    options;
    static db;
    static driver;
    name = "ForgeDB";
    description = "A fast and reliable database extension for Forge";
    version = "1.0.0";
    constructor(options = {
        type: DriverType.Sqlite,
        path: "./forge.db",
    }) {
        super();
        this.options = options;
    }
    init(client) {
        forgescript_1.FunctionManager.load(__dirname + "/functions");
        if (this.options.type === DriverType.Sqlite && typeof this.options.path !== "string")
            throw new Error("path to database file must be a string");
        else if (this.options.type === DriverType.Mongo && typeof this.options.mongoURL !== "string")
            throw new Error("mongo URL must be a string");
        ForgeDB.setDriver(client, this.options);
    }
    static async setDriver(client, options) {
        if (options.type === DriverType.Sqlite) {
            ForgeDB.driver = new quick_db_1.SqliteDriver(options.path);
        }
        else if (options.type === DriverType.Mongo) {
            ForgeDB.driver = new quick_db_1.MongoDriver(options.mongoURL);
            console.log("Connecting to MongoDB...");
            await ForgeDB.driver.connect();
            console.log("Connected to MongoDB!");
        }
        ForgeDB.db = new quick_db_1.QuickDB({
            driver: ForgeDB.driver,
        });
        client.db = ForgeDB.db.table("main");
    }
    static makeIdentifier(type, id) {
        return `${type}_${id}`;
    }
    static get(type, id) {
        return this.db.get(this.makeIdentifier(type, id)) ?? {};
    }
    static set(type, id, value) {
        const identifier = this.makeIdentifier(type, id);
        return this.db.set(identifier, {
            identifier,
            id,
            type,
            value,
        });
    }
    static delete(type, id) {
        return this.db.delete(this.makeIdentifier(type, id));
    }
    static async allWithType(type) {
        return (await this.db.startsWith(type)).map((x) => x.value);
    }
    static async all(filter = () => true) {
        const all = await this.db.all();
        return all.map((x) => x.value).filter(filter);
    }
    static async deleteWithFilter(filter) {
        const all = await this.db.all();
        return Promise.all(all.filter((x) => filter(x.value)).map((x) => this.db.delete(x.id)));
    }
    static deleteAll() {
        return this.db.deleteAll();
    }
}
exports.ForgeDB = ForgeDB;
//# sourceMappingURL=index.js.map