import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

// Type of context object
export type MyContext {
   em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}