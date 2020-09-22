import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
   //------------------QUERIES------------------//
   @Query(() => [Post])
   async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
      
      return await em.find(Post, {});
   }

   @Query(() => Post, { nullable : true })
   async post(
      @Arg('id') id: number, 
      @Ctx() { em }: MyContext): 
      Promise<Post | null> {
      return await em.findOne(Post, { id });
   }

   //------------------MUTATIONS------------------//
   @Mutation(() => Post)
   async createPost(
      @Arg('title') title: string, 
      @Ctx() { em }: MyContext
   ): Promise<Post> {
      const post = em.create(Post, { title });
      await em.persistAndFlush(post);
      return post;
   }

   @Mutation(() => Post, { nullable: true })
   async updatePost(
      @Arg('id') id: number,
      @Arg('title', () => String, { nullable: true }) title: string, 
      @Ctx() { em }: MyContext
   ): Promise<Post | null> {
      const post = await em.findOne(Post, { id });
      if(!post){
         return null;
      }
      if(typeof title !== 'undefined'){
         post.title = title;
         await em.persistAndFlush(post);
      }
      return post;
   }

   @Mutation(() => Boolean)
   async deletePost(
      @Arg('id') id: number, 
      @Ctx() { em }: MyContext
   ): Promise<boolean> {
      try {
         await em.nativeDelete(Post, { id });
         return true;
      } catch (error) {
         console.log(error.message);
         return false;
      }
      
   }
}