import { User } from 'src/users/entity/user.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Group' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 })
  name: string;

  // group : workspace
  @ManyToOne(() => Workspace, (workspace) => workspace.groups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator' })
  creator: User;

  @Column({ default: 0 })
  memberCount: number;

  // group : users
  @ManyToMany(() => User, (user) => user.groups, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'group_member' })
  members: User[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
