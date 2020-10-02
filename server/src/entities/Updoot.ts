import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// Convert class to graphql type
@ObjectType()
@Entity()
export class Updoot extends BaseEntity{
   @Column({ type: "int"})
   value: number

   @PrimaryColumn()
   userId: number;

   @ManyToOne(() => User, user => user.updoots)
   user: User;

   @PrimaryColumn()
   postId: number;

   @ManyToOne(() => Post, post => post.updoots)
   post: Post;

}
