import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Redis } from "ioredis";

// Type of context object
export type MyContext = {
   em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
   req: Request & { session: Express.Session };
   res: Response;
   redis: Redis;
}