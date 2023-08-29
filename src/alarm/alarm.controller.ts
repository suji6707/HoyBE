import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth.guard';
import { AlarmService } from './alarm.service';

@Controller('workspace/:workspaceId/alarm')
export class AlarmController {
  constructor(private alarmService: AlarmService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAlarmForUser(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.alarmService.getAlarmForUser(userId, workspaceId);
  }
}

/* FCM */
// @UseGuards(AuthGuard)
// @Post('save-token')
// async saveToken(@Req() req, @Body('token') token: string) {
// 	const userId = req.userId;
// 	await
// }
