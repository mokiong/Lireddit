import { Resolver, Query, Mutation, Field, Arg, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utilities/validateRegister";
import { sendEmail } from "../utilities/sendEmail";
import { v4 } from "uuid";


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
      if(!req.session.userId){
         return null;
      }

      const user = await em.findOne(User, { id: req.session.userId});
      return user;
   }


   //------MUTATIONS-----//

   @Mutation(() => UserResponse)
   async changePassword(
      @Arg('token') token: string,
      @Arg('newPassword') newPassword: string,
      @Ctx() { em, redis, req }: MyContext
   ) : Promise<UserResponse> {
      if(newPassword.trim().length <=2){
         return {
            errors: [
               {
                  field: 'newPassword',
                  message: 'length must be greater than 2!'
               }
            ]
         }
      };

      const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

      if(!userId){
         return {
            errors: [
               {
                  field: 'token',
                  message: 'token expired'
               }  
            ]
         };
      }

      const user = await em.findOne(User, { id: +userId })

      if(!user){
         return {
            errors: [
               {
                  field: 'token',
                  message: 'user no longer exist'
               }  
            ]
         };
      }

      user.password = await argon2.hash(newPassword);
      await em.persistAndFlush(user);

      // login after change password
      req.session.userId = user.id;

      return {user};
   };


   @Mutation(() => Boolean)
   async forgotPassword(
      @Arg('email') email: string,
      @Ctx() {em, redis} : MyContext
   ) {
      const user = await em.findOne(User, {email});
      if(!user){
         return true;
      }

      const token = v4();

      await redis.set(
         FORGET_PASSWORD_PREFIX + token, 
         user.id, 
         'ex', 
         1000 * 60 * 60 * 24           // 1 day expiration
      );

      await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset passsword</a>`)

      return true;
   }
   

   @Mutation(() => UserResponse)
   async register(
      @Arg('options') options : UsernamePasswordInput,
      @Ctx() { em, req }: MyContext
   ): Promise<UserResponse> {
      const errors = validateRegister(options);

      if(errors){
         return {errors};
      }

      const hashedPassword = await argon2.hash(options.password);
      let user;
      try {
         const result = await (em as EntityManager)
            .createQueryBuilder(User)
            .getKnexQuery()
            .insert({
               username: options.username,
               email: options.email,
               password: hashedPassword,
               created_at: new Date(),
               updated_at: new Date() 
            }).returning("*"); 
         user = result[0];
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

      req.session.userId = user.id;
      return { user };
   }


   @Mutation(() => UserResponse)
   async login(
      @Arg('usernameOrEmail') usernameOrEmail: string,
      @Arg('password') password: string,
      @Ctx() { em, req }: MyContext
   ): Promise<UserResponse> {
      const user = await em.findOne(
         User, 
         usernameOrEmail.includes("@") 
            ? { email: usernameOrEmail } 
            : { username: usernameOrEmail }
      );
      
      if(!user){
         return {
            errors: [{
               field: "usernameOrEmail",
               message: "Username doesn't exist",
            }]
         };
      }
      const validPassword = await argon2.verify(user.password, password);
      
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


   @Mutation(() => Boolean)
   logout(
      @Ctx() { req, res }: MyContext
   ) {
      return new Promise(resolve => req.session.destroy(err => {
         if(err){
            console.log(err);
            resolve(false);
            return;
         }
         res.clearCookie(COOKIE_NAME);
         resolve(true);
      }));
   }
}