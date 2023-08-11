import { Group } from 'src/group/entity/group.entity';
import { Task } from 'src/task/entity/task.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { WorkspaceInvitation } from 'src/workspace/entity/workspace_invitations.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 })
  name: string;

  @Column({ length: 127, unique: true }) // 소셜로그인시 unique 제거
  email: string;

  @Column({ length: 127 })
  password: string;

  @Column({ length: 127 })
  phone: string;

  @Column({ length: 255, nullable: true }) // 프로필사진
  imgUrl?: string;

  @Column({ length: 511, nullable: true }) // 소셜로그인
  token?: string;

  // 워크스페이스 매핑
  @ManyToMany(() => Workspace, (workspace) => workspace.members)
  workspaces: Workspace[];

  // 워크스페이스 초대 매핑
  @OneToMany(
    () => WorkspaceInvitation,
    (workspaceInvitation) => workspaceInvitation.invitedUser,
  )
  workspaceInvitations: WorkspaceInvitation[];

  // 그룹 매핑
  @ManyToMany(() => Group, (group) => group.members)
  groups: Group[];

  // Todo 매핑
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
