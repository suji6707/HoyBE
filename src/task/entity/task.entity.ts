import { group } from 'console';
import { Group } from 'src/group/entity/group.entity';
import { User } from 'src/users/entity/user.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'Task' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 511 })
  title: string;

  // task: user
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: User;

  // task : workspace
  @ManyToOne(() => Workspace, (workspace) => workspace.tasks)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  // task : group -> 그룹별 task 조회
  @ManyToOne(() => Group, (group) => group.tasks)
  @JoinColumn()
  group: Group;

  @Column({ default: 0 }) // 0: 일반, 1: 중요
  priority: number;

  @Column({ default: false })
  status: boolean; // false: 미완, true: 완료

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;
}
