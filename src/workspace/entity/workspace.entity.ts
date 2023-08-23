import { Group } from 'src/group/entity/group.entity';
import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkspaceInvitation } from './workspace_invitations.entity';
import { WorkspaceMember } from './workspace_member.entity';
import { Favorites } from 'src/favorites/entity/favorites.entity';

@Entity({ name: 'Workspace' })
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 }) // 워크스페이스 이름
  name: string;

  @Column({ length: 511, nullable: true })
  imgUrl?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'host' }) // 방장 userId
  host: User;

  @Column({ default: 1 }) // 실제 들어온 멤버 수
  memberCount: number;

  @Column({ default: 1 }) // 초대 수 (수락여부는 workspace_invitation)
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
  @OneToMany(() => Task, (task) => task.workspace)
  tasks: Task[];

  // worksapce : favorites
  @OneToMany(() => Task, (task) => task.workspace)
  favorites: Favorites[];

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
