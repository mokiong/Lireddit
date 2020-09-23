
import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// Convert class to graphql type
@ObjectType()
@Entity()
export class Post extends BaseEntity{
   @Field()
   @PrimaryGeneratedColumn()
   id!: number;

   @Field(() => String)
   @CreateDateColumn()
   createdAt: Date;

   @Field(() => String)
   @UpdateDateColumn()
   updatedAt: Date;

   // GraphQL doesnt expose property if @Field is removed
   @Field()
   @Column()
   title!: string;
}
