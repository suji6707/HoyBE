import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from './entity/alarm.entity';
import { WorkspaceGuard } from 'src/workspace.guard';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';
import { Workspace } from 'src/workspace/entity/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm, WorkspaceMember, Workspace])],
  controllers: [AlarmController],
  providers: [AlarmService, WorkspaceGuard],
})
export class AlarmModule {}
