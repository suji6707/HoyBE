import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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
  @ManyToOne(() => User, (user) => user.alarmTo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target' })
  target: User;

  // 누가 올린
  @ManyToOne(() => User, (user) => user.alarmBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source' })
  source: User;

  // 어떤 Todo에 대한
  @ManyToOne(() => Task, (task) => task.alarms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task' })
  task: Task;

  // @OneToOne(() => Comment, (comment) => comment.alarm)
  // @JoinColumn({ name: 'comment' })
  // comment: Comment;

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
