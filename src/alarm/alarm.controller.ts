import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { AlarmService } from './alarm.service';
import { WorkspaceGuard } from 'src/workspace.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('workspace/:workspaceId/alarm')
export class AlarmController {
  constructor(private alarmService: AlarmService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAlarmForUser(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.alarmService.getAlarmForUser(userId, workspaceId);
  }

  // @UseGuards(AuthGuard, WorkspaceGuard)
  @Post(':alarmId/status')
  async markAsRead(@Param('alarmId') alarmId: number) {
    return await this.alarmService.markAsRead(alarmId);
  }

  @UseGuards(AuthGuard, WorkspaceGuard)
  @Delete(':alarmId')
  async deleteAlarm(@Param('alarmId') alarmId: number) {
    return await this.alarmService.deleteAlarm(alarmId);
  }
}

/* FCM */
// @UseGuards(AuthGuard)
// @Post('save-token')
// async saveToken(@Req() req, @Body('token') token: string) {
// 	const userId = req.userId;
// 	await
// }
