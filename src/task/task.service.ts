import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { addDays, parseISO, subDays, format } from 'date-fns';
import { Task } from 'src/task/entity/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ko } from 'date-fns/locale';
import { TaskResponse } from './interface/task.interface';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Workspace } from 'src/workspace/entity/workspace.entity';
import { User } from 'src/users/entity/user.entity';

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
  ): Promise<TaskResponse[]> {
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
    const tasks = await this.taskRepo.find({
      where: {
        user: { id: userId },
        workspace: { id: workspaceId },
        scheduleDate: Between(startDate, endDate),
      },
      relations: ['user', 'workspace'], // 릴레이션은 JOIN ON과도 같음
    });

    // 날짜 기준으로 그룹화된 결과를 저장할 배열
    const result: TaskResponse[] = []; // 배열

    for (const task of tasks) {
      // 포멧 변경할 날짜
      const formattedDate = new Date(task.scheduleDate);
      // 키값 (문자열 형식 날짜)
      const dateStr = format(formattedDate, 'yyyy-MM-dd');

      let taskResponse = result.find((taskRes) => taskRes.date === dateStr);

      if (!taskResponse) {
        taskResponse = {
          date: dateStr,
          dayOfWeek: format(formattedDate, 'EEE', { locale: ko }),
          day: format(formattedDate, 'M/d'),
          dDay: false, // dueDate 로직에 따라 업데이트 필요
          tasks: [],
        };
        result.push(taskResponse);
      }
      console.log('fr: result: ', result); // 같은 날짜면 두 번 뜸.

      // tasks 배열 채우기
      taskResponse.tasks.push({
        id: task.id,
        title: task.title,
        userId: task.user.id,
        priority: task.priority, // 0또는 1
        done: task.status, // boolean
        commentCount: 0, // 추가하기
        scheduleDate: task.scheduleDate,
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }
}
