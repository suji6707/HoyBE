import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alarm } from './entity/alarm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AlarmService {
  constructor(@InjectRepository(Alarm) private alarmRepo: Repository<Alarm>) {}

  // find 조건: Alarm.target.id가 userId(접속한 사람)에 해당하는 알림을 전부 조회
  // source(코멘트 작성자)는 imgUrl, nickname(해당 workspaceId) 정보 필요
  async getAlarmForUser(userId: number, workspaceId: number) {
    const alarms = await this.alarmRepo
      .createQueryBuilder('alarm')
      .innerJoin('alarm.task', 'task')
      .innerJoinAndSelect('alarm.source', 'sourceUser')
      .innerJoin(
        'workspace_member',
        'workspaceMember',
        'workspaceMember.workspaceId = :workspaceId AND workspaceMember.userId = sourceUser.id',
        { workspaceId: workspaceId },
      )
      .where('alarm.target.id = :userId', { userId: userId })
      .select('sourceUser.id', 'userId')
      .addSelect('sourceUser.imgUrl', 'imgUrl')
      .addSelect('workspaceMember.nickname', 'nickname')
      .addSelect(['task.id', 'task.title'])
      .orderBy({
        'alarm.status': 'DESC',
        'alarm.createdAt': 'DESC',
      })
      .getRawMany();

    return alarms;
  }

  async markAsRead() {
    // 특정 알림을 읽음 처리.
    // id로 찾아서, 있으면 READ 처리.
  }

  // async deleteAlarm() {}
}

/**
 * 알림에 필요한 요소들
 * 1. 누구에 대한, 어떤 taskId에 대한, 어떤 commentId 코멘트인지.
 * 	-> 그 commentId의 userId를 찾아 imgUrl을 가져오면 됨.
 * 2. 읽음 여부. READ /
 * 3. 삭제: 하드 delete.
 *
 */
