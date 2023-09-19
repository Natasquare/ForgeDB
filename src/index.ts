import { ForgeClient, ForgeExtension, FunctionManager } from "forgescript"
import { QuickDB, SqliteDriver, MongoDriver } from "quick.db"

export type QuickDBTable = QuickDB<IQuickDBData>

export interface IQuickDBData {
    identifier: string
    id: string
    type: string
    value: string
}

export enum DriverType {
    Sqlite = "sqlite",
    Mongo = "mongo",
}

export type ForgeDBOptions =
    | {
          type: DriverType.Sqlite
          path: string
      }
    | {
          type: DriverType.Mongo
          mongoURL: string
      }

export class ForgeDB extends ForgeExtension {
    public static db: QuickDBTable
    public static driver: SqliteDriver | MongoDriver

    name: string = "ForgeDB"
    description: string = "A fast and reliable database extension for Forge"
    version: string = "1.0.0"

    public constructor(
        public readonly options: ForgeDBOptions = {
            type: DriverType.Sqlite,
            path: "./forge.db",
        }
    ) {
        super()
    }

    init(client: ForgeClient) {
        FunctionManager.load(__dirname + "/functions")
        if (this.options.type === DriverType.Sqlite && typeof this.options.path !== "string") throw new Error("path to database file must be a string")
        else if (this.options.type === DriverType.Mongo && typeof this.options.mongoURL !== "string") throw new Error("mongo URL must be a string")
        ForgeDB.setDriver(client, this.options)
    }

    public static async setDriver(client: ForgeClient, options: ForgeDBOptions) {
        if (options.type === DriverType.Sqlite) {
            ForgeDB.driver = new SqliteDriver(options.path)
        } else if (options.type === DriverType.Mongo) {
            ForgeDB.driver = new MongoDriver(options.mongoURL)
            console.log("Connecting to MongoDB...")
            await ForgeDB.driver.connect()
            console.log("Connected to MongoDB!")
        }
        ForgeDB.db = new QuickDB({
            driver: ForgeDB.driver,
        })
        client.db = ForgeDB.db.table("main")
    }

    public static makeIdentifier(type: string, id: string) {
        return `${type}_${id}`
    }

    public static get(type: string, id: string) {
        return this.db.get(this.makeIdentifier(type, id)) ?? {}
    }

    public static set(type: string, id: string, value: string) {
        const identifier = this.makeIdentifier(type, id)
        return this.db.set(identifier, {
            identifier,
            id,
            type,
            value,
        })
    }

    public static delete(type: string, id: string) {
        return this.db.delete(this.makeIdentifier(type, id))
    }

    public static async allWithType(type: string) {
        return (await this.db.startsWith(type)).map((x) => x.value)
    }

    public static async all(filter: (row: IQuickDBData) => boolean = () => true) {
        const all = await this.db.all()
        return all.map((x) => x.value).filter(filter)
    }

    public static async deleteWithFilter(filter: (row: IQuickDBData) => boolean) {
        const all = await this.db.all()
        return Promise.all(all.filter((x) => filter(x.value)).map((x) => this.db.delete(x.id)))
    }

    public static deleteAll() {
        return this.db.deleteAll()
    }
}
