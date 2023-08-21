import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entity/workspace.entity';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from './entity/workspace_member.entity';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';
import { InvitationStatus } from './entity/workspace_invitations.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepo: Repository<WorkspaceInvitation>,
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
    // 해당 유저가 만든 워크스페이스 이름 중 동일한 이름이 있으면 Conflict error
    const savedWorkspace = await this.workspaceRepo.findOne({
      where: {
        name: name,
        host: { id: userId },
      },
      relations: ['host'],
    });
    if (savedWorkspace) {
      throw new ConflictException('이미 존재하는 워크스페이스입니다');
    }

    // workspace 저장
    workspace.name = name;
    workspace.host = user;
    await this.workspaceRepo.insert(workspace);

    // WorkspaceMember 객체 생성
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspaceMember.nickname = user.name;

    // 해당 유저를 member로 추가 (매핑테이블)
    await this.workspaceMemberRepo.insert(workspaceMember);

    return workspace;
  }

  // 이메일 초대를 통한 추가
  async addUserToWorkspace(
    user: User,
    workspaceId: number,
    uniqueToken?: string,
  ) {
    // workspace 조회 및 예외처리
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('해당 워크스페이스를 찾을 수 없습니다');
    }

    // WorkspaceMember 객체 생성
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspaceMember.nickname = user.name; // 구글 로그인 이름 넣기
    await this.workspaceMemberRepo.insert(workspaceMember);

    // Workspace 업데이트
    await this.workspaceRepo.update(workspaceId, {
      memberCount: () => 'memberCount + 1',
    });

    // workspaceInvitation 업데이트
    await this.invitationRepo.update(uniqueToken, {
      status: () => InvitationStatus.ACCEPTED,
    });

    return workspaceMember;
  }
}
