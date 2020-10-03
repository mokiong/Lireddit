
import { ObjectType, Field, Int } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Updoot } from "./Updoot";
import { User } from "./User";

// Convert class to graphql type
@ObjectType()
@Entity()
export class Post extends BaseEntity{
   @Field()
   @PrimaryGeneratedColumn()
   id!: number;

   // GraphQL doesnt expose property if @Field is removed
   @Field()
   @Column()
   title!: string;

   @Field()
   @Column()
   text!: string;

   @Field()
   @Column({ type: "int", default: 0 })
   points!: number;

   @Field()
   @ManyToOne(() => User, user => user.posts)
   creator: User;

   @Field()
   @Column()
   creatorId: number;

   @OneToMany(() => Updoot, updoot => updoot.post)
   updoots: Updoot[];

   @Field(() => Int, {nullable: true})
   voteStatus: number | null;

   @Field(() => String)
   @CreateDateColumn()
   createdAt: Date;

   @Field(() => String)
   @UpdateDateColumn()
   updatedAt: Date;
}
