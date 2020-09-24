import { Resolver, Query, Ctx, Arg, Mutation, InputType, Field, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { isAuth } from "../middlewares/isAuth";


@InputType()
class PostInput {
   @Field()
   title: string
   @Field()
   text: string
}

@Resolver()
export class PostResolver {
   //------------------QUERIES------------------//
   @Query(() => [Post])
   async posts(@Ctx() {}: MyContext): Promise<Post[]> {
      
      return await Post.find();
   }

   @Query(() => Post, { nullable : true })
   async post(
      @Arg('id') id: number, 
      @Ctx() { }: MyContext): 
      Promise<Post | undefined> {
      return await Post.findOne(id);
   }

   //------------------MUTATIONS------------------//
   @Mutation(() => Post)
   @UseMiddleware(isAuth)
   async createPost(
      @Arg('input') input: PostInput, 
      @Ctx(){ req }: MyContext
   ): Promise<Post> {
      // 2 sql queries
      return Post.create({
         ...input,
         creatorId: req.session.userId
      }).save();
   }

   @Mutation(() => Post, { nullable: true })
   async updatePost(
      @Arg('id') id: number,
      @Arg('title', () => String, { nullable: true }) title: string, 
   ): Promise<Post | null> {
      const post = await Post.findOne(id)
      if(!post){
         return null;
      }
      if(typeof title !== 'undefined'){
         await Post.update({ id }, { title })
      }
      return post;
   }

   @Mutation(() => Boolean)
   async deletePost(
      @Arg('id') id: number, 
   ): Promise<boolean> {
      await Post.delete(id);
      return true;
   }
}