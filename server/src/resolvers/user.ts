import { Resolver, Query, Mutation, Field, Arg, Ctx, ObjectType, FieldResolver, Root } from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utilities/validateRegister";
import { sendEmail } from "../utilities/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";


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



@Resolver(User)
export class UserResolver {
   @FieldResolver(() => String)
   email(
      @Root() user: User,
      @Ctx() {req}: MyContext
   ) {
      if(req.session.userId === user.id){
         return user.email;
      }

      return "";
   };

   //------QUERIES-----//

   @Query(() => [User])
   async users(@Ctx() { }: MyContext): Promise<User[]> {
      return await User.find();
   }


   @Query(() => User, { nullable: true })
   me(@Ctx() { req }: MyContext){
      if(!req.session.userId){
         return null;
      }

      return User.findOne(req.session.userId);
   }


   //------MUTATIONS-----//

   @Mutation(() => UserResponse)
   async changePassword(
      @Arg('token') token: string,
      @Arg('newPassword') newPassword: string,
      @Ctx() { redis, req }: MyContext
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

      const redisKey = FORGET_PASSWORD_PREFIX + token;
      const userId = await redis.get(redisKey);
      
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
      
      const parsedUserId = +userId
      const user = await User.findOne(parsedUserId);

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

      await User.update({id: parsedUserId}, {
         password: await argon2.hash(newPassword)
      });

      // delete token on redis
      await redis.del(redisKey);

      // login after change password
      req.session.userId = user.id;

      return {user};
   };


   @Mutation(() => Boolean)
   async forgotPassword(
      @Arg('email') email: string,
      @Ctx() { redis} : MyContext
   ) {
      const user = await User.findOne({where: { email }});
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
      @Ctx() { req }: MyContext
   ): Promise<UserResponse> {
      const errors = validateRegister(options);

      if(errors){
         return {errors};
      }

      const hashedPassword = await argon2.hash(options.password);
      let user;
      try {
         const result = await getConnection()
         .createQueryBuilder()
         .insert()
         .into(User)
         .values({
            username: options.username,
               email: options.email,
               password: hashedPassword,
         })
         .returning("*")
         .execute();

         user = result.raw[0];
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
      @Ctx() { req }: MyContext
   ): Promise<UserResponse> {
      const user = await User.findOne(
         usernameOrEmail.includes("@") 
            ? { where: { email: usernameOrEmail }} 
            : { where: {username: usernameOrEmail }}
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