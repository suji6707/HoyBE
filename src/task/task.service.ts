import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { addDays, parseISO, subDays } from 'date-fns';
import { Task } from 'src/task/entity/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WorkspaceMember } from 'src/workspace/entity/workspace_member.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
  ) {}

  // Task 생성
  async createTask(
    workspaceId: number,
    userId: number,
    createTaskDto: CreateTaskDto,
  ) {
    // 객체 저장에 필요한 정보들
    const { title, priority, status, date } = createTaskDto;
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    const user = await this.userRepo.findOne({ where: { id: userId } });

    const task = new Task();
    task.title = title;
    task.priority = priority; // 따로 토글 API 있음
    task.status = status;
    task.scheduleDate = parseISO(date);
    task.workspace = workspace;
    task.user = user;

    return await this.taskRepo.insert(task);
  }

  // 날짜별 3일치 Task 조회
  async getTasksByDate(
    workspaceId: number,
    userId: number,
    dateQuery?: string,
  ): Promise<Task[]> {
    let selectedDate;
    if (dateQuery) {
      // 쿼리 문자열에서 받은 날짜 파싱
      selectedDate = parseISO(dateQuery); // 날짜로 변환
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
      .orderBy({
        'task.status': 'ASC',
        'task.scheduleDate': 'ASC',
        'task.updatedAt': 'DESC',
      })
      .getMany();

    return tasks;
  }

  // 날짜별 하루치 Task 조회
  async getTasksByUser(workspaceId: number, userId: number, date: string) {
    const selectedDate = parseISO(date);
    const nextDate = addDays(selectedDate, 1);

    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.userId = :userId', { userId })
      .andWhere('task.scheduleDate >= :selectedDate', { selectedDate })
      .andWhere('task.scheduleDate < :nextDate', { nextDate })
      .orderBy({
        'task.status': 'ASC',
        'task.scheduleDate': 'ASC',
        'task.updatedAt': 'DESC',
      })
      .getMany();

    return tasks;
  }

  // Task 상세 조회
  async getTaskDetail(userId: number, taskId: number) {
    const user = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoin('workspaceMember.member', 'user')
      .select('user.id', 'userId')
      .addSelect('user.imgUrl', 'imgUrl')
      .where('user.id = :userId', { userId: userId })
      .addSelect('workspaceMember.nickname', 'nickname')
      .getRawOne();

    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    return { user, task };
  }

  // Task 수정 - 완료 여부 표시
  async updateTaskStatus(taskId: number) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    const updatedStatus = !task.status;
    await this.taskRepo.update(taskId, { status: updatedStatus });
    // 업데이트된 상태에 따라 done 설정
    const done = updatedStatus ? 1 : 0;
    return { done };
  }

  // Task 수정 - 중요도 표시
  async updateTaskPriority(taskId: number) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    const updatedPriority = task.priority === 0 ? 1 : 0;
    await this.taskRepo.update(taskId, { priority: updatedPriority });
    return { updatedPriority };
  }

  // Task 수정 - 디테일 수정
  async updateTaskDetail(taskId: number, updateTaskDto: UpdateTaskDto) {
    const { title, priority } = updateTaskDto;
    console.log(title, priority);

    return await this.taskRepo.update(taskId, {
      ...(title && { title: title }),
      ...(typeof priority !== undefined && { priority: priority }),
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
