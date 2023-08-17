import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { GroupController } from './group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Workspace, User])],
  providers: [GroupService],
  exports: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
