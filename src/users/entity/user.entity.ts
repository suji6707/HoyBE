import { Alarm } from 'src/alarm/entity/alarm.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { Favorites } from 'src/favorites/entity/favorites.entity';
import { Group } from 'src/group/entity/group.entity';
import { Task } from 'src/task/entity/task.entity';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 })
  name: string;

  @Column({ length: 127, unique: true }) // 일반 로그인 병행시에는 unique 제거
  email: string;

  @Column({ length: 127, default: '', select: false }) // 소셜로그인시 unique 제거
  googleId: string;

  @Column({ length: 255, nullable: true }) // 프로필사진
  imgUrl?: string;

  @Column({ length: 127, nullable: true, select: false })
  phone?: string;

  @Column({ length: 511, nullable: true, select: false }) // 소셜로그인
  token?: string;

  // @Column({ length: 511, nullable: true, select: false })
  // fcmToken?: string;

  // Workspace Member 매핑
  @OneToMany(
    () => WorkspaceMember,
    (workspaceMember) => workspaceMember.member,
    { cascade: true },
  )
  workspaceMembers: WorkspaceMember[];

  // Group Member 매핑
  @ManyToMany(() => Group, (group) => group.members, { cascade: true })
  groups: Group[];

  // Todo 매핑
  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks: Task[];

  // Comment 매핑
  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];

  // Favorites 매핑
  @OneToMany(() => Favorites, (favorites) => favorites.target, {
    cascade: true,
  })
  favorites: Favorites[]; // 내가 즐겨찾기 설정한 사람들

  @OneToMany(() => Favorites, (favorites) => favorites.source, {
    cascade: true,
  })
  favoritedBy: Favorites[]; // 나를 즐겨찾기로 설정한 사람들

  // Alarm 매핑
  @OneToMany(() => Alarm, (alarm) => alarm.target, {
    cascade: true,
  })
  alarmTo: Alarm[]; // 누구에 대한

  @OneToMany(() => Alarm, (alarm) => alarm.source, {
    cascade: true,
  })
  alarmBy: Alarm[]; // 누가 올린

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
