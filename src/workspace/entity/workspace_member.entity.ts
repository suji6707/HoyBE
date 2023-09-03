import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from 'src/users/entity/user.entity';

@Entity({ name: 'workspace_member' })
@Unique('UQ_WORKSPACE_MEMBER', ['workspace', 'member'])
export class WorkspaceMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.workspaceMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  member: User;

  @Column({ default: false })
  admin: boolean;

  // 워크스페이스마다 닉네임 설정 가능
  // accpetInvitation() 함수에서 User.name을 nickname에 넣음.
  @Column({ length: 127, nullable: true })
  nickname?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
