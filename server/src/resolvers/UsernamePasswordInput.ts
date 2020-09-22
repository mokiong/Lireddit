import { InputType, Field } from "type-graphql";

// InputType for args

@InputType()
export class UsernamePasswordInput {
   @Field()
   username: string;
   @Field()
   password: string;
   @Field()
   email: string;
}
