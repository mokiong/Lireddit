import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

// Convert class to graphql type
@ObjectType()
@Entity()
export class User {
   @Field()
   @PrimaryKey()
   id!: number;

   @Field(() => String)
   @Property({ type: 'date' })
   createdAt = new Date();

   @Field(() => String)
   @Property({ type: 'date', onUpdate: () => new Date() })
   updatedAt = new Date();

   // GraphQL doesnt expose property if @Field is removed
   @Field()
   @Property({ type: 'text', unique: true })
   username!: string;

   @Field()
   @Property({ type: 'text', unique: true })
   email!: string;

   @Property({ type: 'text'})
   password!: string;
}