import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ }  from "./constants";
import microConfig   from "./mikro-orm.config";
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


const main = async () => {
   // Connect to database
   const orm = await MikroORM.init(microConfig);
   // Run migration
   await orm.getMigrator().up();

   const app = express();

   const RedisStore = connectRedis(session);
   const redis = new Redis();

   const apolloServer = new ApolloServer({
      schema: await buildSchema({
         resolvers: [HelloResolver, PostResolver, UserResolver],
         validate: false
      }),
      // CONTEXT - a special object accesible by all reslovers
      context: ({ req, res }) => ({ em: orm.em, req, res, redis })
      
   });
   
   
   // Middlewares
   app.use(cors({
      origin: "http://localhost:3000",
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
            secure: __prod__                          // cookie only works on https
         },
         saveUninitialized: false,
         secret: 'adadsdasdasdasd',
         resave: false,
      })
   );
   // Creates graphQL endpoint on express
   apolloServer.applyMiddleware({ 
      app, 
      cors: { origin: false } 
   });

   
   app.listen(4000, () => {
      console.log(`Server starting at localhost: 4000`)
   });

};

main().catch(err => {
   console.error(err);
}); 