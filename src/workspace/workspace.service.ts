import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entity/workspace.entity';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { User } from 'src/users/entity/user.entity';
import { WorkspaceMember } from './entity/workspace_member.entity';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';
import { InvitationStatus } from './entity/workspace_invitations.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepo: Repository<WorkspaceInvitation>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
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
  async acceptInvitaion(uniqueToken: string, email: string, userId: number) {
    let decoded;
    try {
      decoded = await this.jwtService.verifyAsync(uniqueToken);
    } catch (err) {
      console.log(err.message);
      if (err.message === 'jwt expired') {
        throw new UnauthorizedException('토큰이 만료되었습니다');
      } else {
        throw err;
      }
    }

    const workspaceId = decoded.workspaceId;
    const invitedEmail = decoded.email;

    // 유저 인증: 실제 로그인 유저(credential. email)과 초대된 유저(login()파라미터)가 같은지 확인
    if (email !== invitedEmail) {
      console.log(email, invitedEmail);
      throw new BadRequestException('로그인한 유저와 초대된 유저가 다릅니다');
    }
    await this.addUserToWorkspace(userId, workspaceId, uniqueToken);
  }

  async addUserToWorkspace(
    userId: number,
    workspaceId: number,
    uniqueToken: string,
  ) {
    // workspace 조회 및 예외처리
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('해당 워크스페이스를 찾을 수 없습니다');
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });

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

  // 내가 멤버로 속해있는 워크스페이스 조회
  // async

  // 워크스페이스 멤버 조회
  async getAvailableUsers(workspaceId: number) {
    const query = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .innerJoin('workspaceMember.member', 'user')
      .select('user.id', 'userId')
      .addSelect('user.imgUrl', 'imgUrl')
      .addSelect('workspaceMember.nickname', 'nickname');

    // console.log(query.getSql());
    const workspaceMembers = await query.getRawMany();
    return workspaceMembers;
  }

  // workspaceMembers에 내 정보 표시
  async addMeToWorkspaceMembers(workspaceMembers, userId: number) {
    // 나에 해당하는 유저 정보를 workspaceMembers에서 조회
    const meIndex = workspaceMembers.findIndex(
      (member) => member.userId === userId,
    );
    if (meIndex !== -1) {
      const me = workspaceMembers[meIndex];
      // nickname에 (나) 표시
      me.nickname += ' (나)';

      // 배열에서 기존 삭제
      workspaceMembers.splice(meIndex, 1);
      // 배열 맨 앞에 추가
      workspaceMembers.unshift(me);
    }
    return workspaceMembers;
  }
}
