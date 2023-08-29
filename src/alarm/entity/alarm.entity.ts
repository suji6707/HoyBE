import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AlarmStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

@Entity({ name: 'Alarm' })
export class Alarm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AlarmStatus,
  })
  status: AlarmStatus;

  // 누구에 대한
  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target' })
  target: User;

  // 어떤 Todo에 대한
  @ManyToOne(() => Task, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task' })
  task: Task;

  // 누가 올린 Comment
  @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source' })
  source: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}

/* 추후 type 추가될 부분 */
// export enum AlarmType {
//   COMMENT_ADDED = 'COMMENT_ADDED',
//   TODO_COMPLETED = 'TODO_COMPLETED',
// }
// @Column({
// 	type: 'enum',
// 	enum: AlarmType,
// })
// type: AlarmType
