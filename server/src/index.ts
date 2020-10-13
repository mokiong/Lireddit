import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ }  from "./constants";
import express       from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utilities/createUserLoader";
import { createUpdootLoader } from "./utilities/createUpdootLoader";


const main = async () => {
   // Connect to database

   const conn = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // synchronize: true,
      migrations: [path.join(__dirname, "./migrations/*")],
      entities: [Post, User, Updoot]
   })
   // await conn.runMigrations();

   const app = express();

   const RedisStore = connectRedis(session);
   const redis = new Redis(process.env.REDIS_URL);

   const apolloServer = new ApolloServer({
      schema: await buildSchema({
         resolvers: [HelloResolver, PostResolver, UserResolver],
         validate: false
      }),
      // CONTEXT - a special object accesible by all reslovers
      context: ({ req, res }) => ({ 
         req, 
         res, 
         redis, 
         userLoader: createUserLoader(),
         updootLoader: createUpdootLoader()
      })
      
   });
   
   
   // Middlewares
   // Gets cookies and sessions working on proxy environment
   // Tells express that there is one proxy
   app.set('trust proxy', 1);
   app.use(cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
   }))
   app.use(
      session({
         name: COOKIE_NAME,
         store: new RedisStore({ 
            client: redis,
            disableTouch: true
         }),
         cookie: {
            maxAge: 1000 * 60 * 60 * 24 *365 * 10,    // 10 years
            httpOnly: true,                           // good for security, cant access cookie in js frontend
            sameSite: 'lax',                          // protecting csrf
            secure: __prod__,                         // cookie only works on https
            domain: __prod__ ? process.env.COOKIE_DOMAIN : undefined
         },
         saveUninitialized: false,
         secret: process.env.SESSION_KEY,
         resave: false,
      })
   );
   // Creates graphQL endpoint on express
   apolloServer.applyMiddleware({ 
      app, 
      cors: { origin: false } 
   });

   app.listen(+process.env.PORT, () => {
      console.log(`Server starting at localhost: 4000`)
   });

};

main().catch(err => {
   console.error(err);
}); 