import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/task/entity/task.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  // 코멘트 생성
  async addComment(
    userId: number,
    taskId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // 객체 생성
    const comment = new Comment();
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    const { text } = createCommentDto;

    // 코멘트 DB 저장
    comment.task = task;
    comment.user = user;
    comment.text = text;
    await this.commentRepo.insert(comment);

    // Task DB 저장
    await this.taskRepo.update(taskId, {
      commentCount: () => 'commentCount + 1',
    });

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

    console.log('fr: ', createdComment);
    return createdComment;
  }

  // 코멘트 조회
  async viewComment(userId: number, taskId: number) {
    const comments = await this.commentRepo
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
      .where('comment.taskId = :taskId', { taskId: taskId })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    // 각 댓글에 대해 isOwner 프로퍼티 추가
    const commentsWithOwnership = comments.map((comment) => {
      return {
        ...comment,
        isOwner: comment.user.id === userId,
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
  async deleteComment(commentId: number) {
    return await this.commentRepo
      .createQueryBuilder('comment')
      .delete()
      .where('id = :id', { id: commentId })
      .execute();
  }
}
