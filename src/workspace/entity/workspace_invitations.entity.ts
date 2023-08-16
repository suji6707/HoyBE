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

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceInvitations, {
    cascade: true,
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ length: 127 })
  email: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;
}
