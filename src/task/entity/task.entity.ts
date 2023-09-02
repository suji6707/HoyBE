import { Comment } from 'src/comment/entity/comment.entity';
import { User } from 'src/users/entity/user.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
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

@Entity({ name: 'Task' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 511 })
  title: string;

  // task: user  -> 키워드 검색기능 생기면 그 때 cascade 옵션 끄고 나간 사람이 작성한 내역도 볼 수 있게 하면 좋을듯.
  @ManyToOne(() => User, (user) => user.tasks, { cascade: true }) // user 테이블에서 cascade 넣기!!
  @JoinColumn({ name: 'userId' })
  user: User;

  // task : workspace
  @ManyToOne(() => Workspace, (workspace) => workspace.tasks)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  // task : comment
  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 }) // 0: 일반, 1: 중요
  priority: number;

  @Column({ default: false })
  status: boolean; // false: 미완, true: 완료

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  scheduleDate!: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
