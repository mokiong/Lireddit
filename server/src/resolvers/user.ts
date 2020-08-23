import { Resolver, Query, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";

// InputType for args
@InputType()
class UsernamePasswordInput{
   @Field()
   username: string
   @Field()
   password: string
}

// In ObjectType you can return 
@ObjectType()
class FieldError{
   // ? means undefined
   @Field()
   field: string;

   @Field()
   message: string;
}

// In ObjectType you can return 
@ObjectType()
class UserResponse{
   // ? means undefined
   @Field(() => [FieldError], { nullable: true })
   errors?: Error[];

   @Field(() => User, { nullable: true })
   user?: User;
}



@Resolver()
export class UserResolver {
   //------QUERIES-----//
   


   //------MUTATIONS-----//
   @Mutation(() => User)
   async register(
      @Arg('options') options : UsernamePasswordInput
      @Ctx() { em }: MyContext
   ) {
      const hashedPassword = await argon2.hash(options.password);
      const user = em.create(User, { 
         username: options.username,
         password: hashedPassword 
      });
      await em.persistAndFlush(user);
      return user;
   }


   @Mutation(() => UserResponse)
   async login(
      @Arg('options') options : UsernamePasswordInput
      @Ctx() { em }: MyContext
   ): Promise<UserResponse> {
      const user = await em.findOne(User, { username: options.username })
      if(!user){
         return {
            errors: [{
               field: "username",
               message: "Username doesn't exist",
            }]
         };
      }
      const validPassword = await argon2.verify(user.password, options.password);
      
      if(!validPassword){
         return {
            errors: [{
               field: "password",
               message: "Invalid login, Please try again!",
            }]
         };
      }

      return { user };
   }
}