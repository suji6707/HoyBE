import { Group } from 'src/group/entity/group.entity';
import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkspaceInvitation } from './workspace_invitations.entity';
import { WorkspaceMember } from './workspace_member.entity';

@Entity({ name: 'Workspace' })
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 }) // 워크스페이스 이름
  name: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'host' }) // 방장 userId
  host: User;

  @Column({ default: 1 }) // 실제 들어온 멤버 수
  memberCount: number;

  @Column({ default: 1 }) // 초대 수 (수락여부는 workspace_invitation 테이블에)
  invitationCount: number;

  // workspace : user
  @OneToMany(
    () => WorkspaceMember,
    (workspaceMember) => workspaceMember.workspace,
  )
  workspaceMembers: WorkspaceMember[];

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
