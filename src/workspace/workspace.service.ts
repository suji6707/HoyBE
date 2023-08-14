import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/task/entity/task.entity';
import { Between, Repository } from 'typeorm';
import { addDays, parseISO, subDays } from 'date-fns';
import { Workspace } from './entity/workspace.entity';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from './entity/workspace_member.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createWorkspace(
    userId: number,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = new Workspace();
    const user = await this.userRepo.findOne({ where: { id: userId } });

    // 워크스페이스 객체 생성 (Workspace 테이블)
    const { name } = createWorkspaceDto;
    workspace.name = name;
    workspace.host = user;

    // workspace 저장 (이 단계에서 workspace 객체가 DB id를 얻게 됨)
    await this.workspaceRepo.save(workspace);

    // WorkspaceMember 객체 생성
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspace.memberCount += 1;

    // 해당 유저를 member로 추가 (매핑테이블)
    await this.workspaceMemberRepo.save(workspaceMember);

    console.log('fr: workspace', workspace);
    return workspace;
  }

  async addUserToWorkspace() {}

  async findWorkspaceById(workspaceId: number) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    return workspace;
  }

  async findTasksByDate(
    workspaceId: number,
    userId: number,
    dateQuery?: string,
  ): Promise<Task[]> {
    let selectedDate: Date;

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
        createdDate: Between(startDate, endDate),
      },
      relations: ['workspace'],
    });

    return tasks;
  }
}
