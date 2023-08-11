import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Group' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 })
  name: string;

  // group : workspace
  @ManyToOne(() => Workspace, (workspace) => workspace.groups)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  // group : users
  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({ name: 'group_member' })
  members: User[] | null;

  // group : tasks
  @OneToMany(() => Task, (task) => task.group)
  tasks: Task[] | null;
}
