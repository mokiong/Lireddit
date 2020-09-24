import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";

// Convert class to graphql type
@ObjectType()
@Entity()
export class User extends BaseEntity{
   @Field()
   @PrimaryGeneratedColumn()
   id!: number;

   // GraphQL doesnt expose property if @Field is removed
   @Field()
   @Column({ unique: true })
   username!: string;

   @Field()
   @Column({ unique: true })
   email!: string;

   @Column()
   password!: string;

   @OneToMany(() => Post, post => post.creator)
   posts: Post[]


   @Field(() => String)
   @CreateDateColumn()
   createdAt: Date;

   @Field(() => String)
   @UpdateDateColumn()
   updatedAt: Date;
}