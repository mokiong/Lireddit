import { Resolver, Query } from "type-graphql";
import { Post } from "src/entities/Post";

@Resolver()
export class HelloResolver {
   @Query(() => String)
   hello() {
      return 'Hello World'
   }
}