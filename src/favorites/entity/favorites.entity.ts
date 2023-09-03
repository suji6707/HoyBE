import { User } from 'src/users/entity/user.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Favorites' })
@Unique('UQ_FAVORITE', ['workspace', 'source', 'target'])
export class Favorites {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.favoritedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source' })
  source: User;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target' })
  target: User;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}
