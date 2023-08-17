import { Injectable, NotFoundException } from '@nestjs/common';
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
    workspace.name = name;
    workspace.host = user;
    // workspace.memberCount = 1; // 처음 생성할 때는 host 1명. save시 default:1 값이 들어오므로 현재 NaN에 integer를 할당할 수 없음

    // workspace 저장 (이 단계에서 workspace 객체가 DB id를 얻게 됨)
    await this.workspaceRepo.save(workspace);

    // WorkspaceMember 객체 생성
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;

    // 해당 유저를 member로 추가 (매핑테이블)
    await this.workspaceMemberRepo.save(workspaceMember);

    console.log('fr: workspace', workspace);
    return workspace;
  }

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
    await this.workspaceMemberRepo.save(workspaceMember);

    // Workspace 업데이트
    workspace.memberCount += 1;
    await this.workspaceMemberRepo.save(workspace);

    // workspaceInvitation 객체 생성, pending -> accepted
    const workspaceInvitation = await this.invitationRepo.findOne({
      where: { uniqueToken: uniqueToken },
    });
    workspaceInvitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepo.save(workspaceInvitation);

    return workspaceMember;
  }

  async findWorkspaceById(workspaceId: number) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    return workspace;
  }
}
