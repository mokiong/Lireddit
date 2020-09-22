import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
   if(!options.email.includes("@")){
      return [{
         field: 'email',
         message: 'invalid email format'
      }]
   }

   if(options.username.includes("@")){
      return [{
         field: 'username',
         message: 'invalid character in username'
      }]
   }

   if(options.username.length <=2){
      return [{
         field: 'username',
         message: 'length must be greater than 2!'
      }]
   }

   if(options.password.trim().length <=2){
      return [{
         field: 'password',
         message: 'length must be greater than 2!'
      }]
   }
   
   return null;
};