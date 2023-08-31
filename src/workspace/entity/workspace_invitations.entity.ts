import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

@Entity({ name: 'workspace_invitation' })
export class WorkspaceInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
