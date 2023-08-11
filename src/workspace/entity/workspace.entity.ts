import { Group } from 'src/group/entity/group.entity';
import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
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
import { WorkspaceInvitation } from './workspace_invitations.entity';

@Entity({ name: 'Workspace' })
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 }) // 워크스페이스 이름
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'host' }) // 방장 userId
  host: User;

  @Column() // 멤버 수
  memberCount: number;

  // worksapce : user
  @ManyToMany(() => User, (user) => user.workspaces)
  @JoinTable({ name: 'workspace_member' })
  members: User[];

  // workspace : invitation
  @OneToMany(
    () => WorkspaceInvitation,
    (workspaceInvitation) => workspaceInvitation.workspace,
  )
  workspaceInvitations: WorkspaceInvitation[];

  // workspace: group
  @OneToMany(() => Group, (group) => group.workspace)
  groups: Group[];

  // worksapce : task
  // 워크스페이스에 task가 배열로 담기는 게 아니라
  // 참여자들 배열이 있고 각 참여자에 task가 배열로 존재함.
  @OneToMany(() => Task, (task) => task.workspace)
  tasks: Task[];
}
