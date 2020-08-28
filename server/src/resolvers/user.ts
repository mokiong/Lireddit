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
   errors?: FieldError[];

   @Field(() => User, { nullable: true })
   user?: User;
}



@Resolver()
export class UserResolver {
   //------QUERIES-----//
   @Query(() => [User])
   async users(@Ctx() { em }: MyContext): Promise<User[]> {
      return await em.find(User, {});
   }

   @Query(() => User, { nullable: true })
   async me(@Ctx() { req, em }: MyContext){
      console.log(req.session.userId)
      if(!req.session.userId){
         return null;
      }
      console.log(req.session.userId)
      const user = await em.findOne(User, { id: req.session.userId})
      return user;
   }



   //------MUTATIONS-----//
   @Mutation(() => UserResponse)
   async register(
      @Arg('options') options : UsernamePasswordInput,
      @Ctx() { em }: MyContext
   ): Promise<UserResponse> {
      if(options.username.trim().length <=2){
         return {
            errors: [{
               field: 'username',
               message: 'length must be greater than 2!'
            }]
         }
      }

      if(options.password.trim().length <=2){
         return {
            errors: [{
               field: 'password',
               message: 'length must be greater than 2!'
            }]
         }
      }

      const hashedPassword = await argon2.hash(options.password);
      const user = em.create(User, { 
         username: options.username,
         password: hashedPassword 
      });
      try {
         await em.persistAndFlush(user);
      } catch (error) {
         console.log(`ERROR: ${ error }`);
         if(error.code === '23505') {
            console.log('DUPLICATE KEY!!');
            return {
               errors: [{
                  field: 'username',
                  message: 'username already taken'
               }]
            }
         }
      }
      return { user };
   }


   @Mutation(() => UserResponse)
   async login(
      @Arg('options') options : UsernamePasswordInput,
      @Ctx() { em, req }: MyContext
   ): Promise<UserResponse> {
      const user = await em.findOne(User, { username: options.username });
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

      req.session.userId = user.id;
      return { user };
   }
}