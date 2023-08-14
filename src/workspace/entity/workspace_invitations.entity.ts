import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from 'src/users/entity/user.entity';

enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

@Entity({ name: 'workspace_invitation' })
export class WorkspaceInvitation {
  @PrimaryColumn()
  uniqueToken: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceInvitations)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  // @ManyToOne(() => User, (user) => user.workspaceInvitations)
  // @JoinColumn({ name: 'userId' })
  // invitedUser: User;

  @Column({ length: 127 })
  email: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ default: 0 })
  count: number;
}
