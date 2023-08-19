import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { addDays, parseISO, subDays } from 'date-fns';
import { Task } from 'src/task/entity/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // Task 생성
  async addTask(
    workspaceId: number,
    userId: number,
    createTaskDto: CreateTaskDto,
    date: string, // DB 저장시엔 날짜로 변환
  ) {
    // 객체 저장에 필요한 정보들
    console.log('fr: createTaskDto', createTaskDto);
    const { title, priority, status } = createTaskDto;
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    const task = new Task();
    task.title = title;
    task.priority = priority;
    task.status = status;
    task.scheduleDate = parseISO(date);
    task.workspace = workspace;
    task.user = user;

    await this.taskRepo.save(task);
    return task;
  }

  // 날짜별 Task 조회
  async findTasksByDate(
    workspaceId: number,
    userId: number,
    dateQuery?: string,
  ): Promise<Task[]> {
    let selectedDate;
    if (dateQuery) {
      // 쿼리 문자열에서 받은 날짜 파싱
      selectedDate = parseISO(dateQuery);
    } else {
      // 쿼리 스트링이 없을 경우 현재 날짜 사용
      selectedDate = new Date();
    }
    // 선택된 날짜 기준으로 range 계산
    const startDate = subDays(selectedDate, 1);
    const endDate = addDays(selectedDate, 1);

    // 해당 워크스페이스, 유저, 날짜 범위에 맞는 task 조회
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.userId = :userId', { userId })
      .andWhere('task.scheduleDate >= :startDate', { startDate })
      .andWhere('task.scheduleDate <= :endDate', { endDate })
      .orderBy('task.scheduleDate', 'ASC')
      .getMany();

    return tasks;
  }

  // Task 상세 조회
  async viewTask(taskId: number) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    return task;
  }

  // Task 수정
  async updateTask(taskId: number, updateTaskDto: UpdateTaskDto) {
    const { title, priority, status } = updateTaskDto;

    return await this.taskRepo.update(taskId, {
      ...(title && { title: title }),
      ...(priority && { priority: priority }),
      ...(status && { status: status }),
    });
  }

  // Task 삭제
  async deleteTask(taskId: number) {
    return await this.taskRepo
      .createQueryBuilder('task')
      .softDelete()
      .where('id = :id', { id: taskId })
      .execute();
  }
}

// // property가 DTO에 담겨있을 때만 객체에 추가
// if (updateTaskDto.title! == undefined) {
//   updateData.title = updateTaskDto.title;
// }
// if (updateTaskDto.priority! == undefined) {
//   updateData.priority = updateTaskDto.priority;
// }
// if (updateTaskDto.status! == undefined) {
//   updateData.status = updateTaskDto.status;
// }
// console.log(updateData);
// return await this.taskRepo.update(taskId, updateData);
