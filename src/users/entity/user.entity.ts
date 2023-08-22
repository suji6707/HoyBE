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

  @Column({ length: 127, default: '' }) // 소셜로그인시 unique 제거
  googleId: string;

  @Column({ length: 255, nullable: true }) // 프로필사진
  imgUrl?: string;

  @Column({ length: 127, nullable: true })
  phone?: string;

  @Column({ length: 511, nullable: true }) // 소셜로그인
  token?: string;

  // Workspace 매핑
  @OneToMany(() => WorkspaceMember, (workspaceMember) => workspaceMember.member)
  workspaceMembers: WorkspaceMember[];

  // Group 매핑
  @ManyToMany(() => Group, (group) => group.members)
  groups: Group[];

  // Todo 매핑
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  // Comment 매핑
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // Favorites 매핑
  @OneToMany(() => Favorites, (favorites) => favorites.target)
  favorites: Favorites[]; // 내가 즐겨찾기 설정한 사람들

  @OneToMany(() => Favorites, (favorites) => favorites.source)
  favoritedBy: Favorites[]; // 나를 즐겨찾기로 설정한 사람들

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
