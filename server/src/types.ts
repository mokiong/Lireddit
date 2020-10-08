import { Request, Response } from 'express';
import { Redis } from "ioredis";
import { createUpdootLoader } from './utilities/createUpdootLoader';
import { createUserLoader } from './utilities/createUserLoader';

// Type of context object
export type MyContext = {
   req: Request & { session: Express.Session };
   res: Response;
   redis: Redis;
   userLoader: ReturnType<typeof createUserLoader>
   updootLoader: ReturnType<typeof createUpdootLoader>
}