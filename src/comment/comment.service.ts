import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { Alarm, AlarmStatus } from 'src/alarm/entity/alarm.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Alarm) private alarmRepo: Repository<Alarm>,
  ) {}

  // 코멘트 생성
  async addComment(
    userId: number, // 코멘트 단 사람
    taskId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // 객체 생성
    const comment = new Comment();
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['user'],
    });
    const { text } = createCommentDto;
    console.log('fr: ', task);

    if (!user || !task) {
      throw new Error('User or Task not found');
    }

    // 코멘트 DB 저장
    comment.task = task;
    comment.user = user;
    comment.text = text;
    await this.commentRepo.insert(comment);

    // Task DB 저장
    await this.taskRepo.update(taskId, {
      commentCount: () => 'commentCount + 1',
    });

    // Alarm DB 저장
    const alarm = new Alarm();
    alarm.source = user; // 코멘트 작성자
    alarm.target = task.user; // Todo 작성자
    alarm.task = task;
    alarm.status = AlarmStatus.UNREAD; // 기본 상태
    await this.alarmRepo.insert(alarm);

    const createdComment = await this.commentRepo
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.updatedAt',
        'comment.text',
        'user.id',
        'user.name',
        'user.imgUrl',
      ])
      .innerJoin('comment.user', 'user')
      .where('comment.id = :id', { id: comment.id })
      .getMany();

    return createdComment;
  }

  // 코멘트 조회
  async viewComment(userId: number, workspaceId: number, taskId: number) {
    const comments = await this.commentRepo
      .createQueryBuilder('comment')
      .select([
        'comment.id',
        'comment.updatedAt',
        'comment.text',
        'user.id',
        'user.imgUrl',
        'workspaceMember.nickname',
      ])
      .innerJoin('comment.user', 'user')
      .innerJoin(
        'workspace_member',
        'workspaceMember',
        'workspaceMember.userId = user.id AND workspaceMember.workspaceId = :workspaceId',
        { workspaceId: workspaceId },
      )
      .where('comment.taskId = :taskId', { taskId: taskId })
      .orderBy('comment.createdAt', 'DESC')
      .getRawMany();

    // 각 댓글에 대해 isOwner 프로퍼티 추가
    const commentsWithOwnership = comments.map((comment) => {
      console.log(comment);
      return {
        ...comment,
        isOwner: comment.user_id === userId,
      };
    });

    return commentsWithOwnership;
  }

  // 코멘트 수정
  async updateComment(commentId: number, createCommentDto: CreateCommentDto) {
    return await this.commentRepo.update(commentId, {
      text: createCommentDto.text,
    });
  }

  // 코멘트 삭제
  async deleteComment(taskId: number, commentId: number) {
    await this.commentRepo
      .createQueryBuilder('comment')
      .delete()
      .where('id = :id', { id: commentId })
      .execute();

    await this.taskRepo.update(taskId, {
      commentCount: () => 'commentCount - 1',
    });
  }
}
