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
    await this.commentRepo.save(comment);

    // Task DB 저장
    await this.taskRepo.update(taskId, {
      commentCount: () => 'commentCount + 1',
    });
    // task.commentCount += 1;
    // await this.taskRepo.save(task);
  }

  // 코멘트 수정

  // 코멘트 삭제
}
