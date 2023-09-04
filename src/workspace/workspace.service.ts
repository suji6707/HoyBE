import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
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
import 'dotenv/config';

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
    file?: Express.Multer.File,
  ): Promise<Workspace> {
    // 워크스페이스 객체 생성
    const { name } = createWorkspaceDto;
    // 해당 유저가 속한 워크스페이스 이름 중 동일한 이름이 있으면 Conflict error
    const savedWorkspace = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect('workspaceMember.workspace', 'workspace')
      .where('workspace.name = :name', { name: name })
      .andWhere('workspaceMember.member.id = :id', { id: userId })
      .getOne();

    if (savedWorkspace) {
      throw new ConflictException('이미 존재하는 워크스페이스입니다');
    }

    // workspace 저장
    const workspace = new Workspace();
    const user = await this.userRepo.findOne({ where: { id: userId } });
    workspace.name = name;
    workspace.host = user;

    workspace.imgUrl = file
      ? `${process.env.SERVER_DOMAIN}/public/uploads/workspace/${file.filename}`
      : null;
    await this.workspaceRepo.insert(workspace); // memberCount 디폴트 1

    // 만든이를 WorkspaceMember에 추가
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspaceMember.nickname = user.name;
    workspaceMember.admin = true;
    await this.workspaceMemberRepo.insert(workspaceMember);

    return workspace;
  }

  // 워크스페이스 프로필 변경
  async updateWorkspaceProfile(
    workspaceId: number,
    name?: string,
    file?: Express.Multer.File,
  ) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    workspace.name = name ? name : workspace.name;
    workspace.imgUrl = file
      ? `${process.env.SERVER_DOMAIN}/public/uploads/workspace/${file.filename}`
      : workspace.imgUrl;

    return await this.workspaceRepo.save(workspace);
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

    console.log(
      'fr: uniqueToken 디코딩된 workspaceId, email: ',
      workspaceId,
      invitedEmail,
    );

    // 유저 인증: 실제 로그인 유저(credential. email)과 초대된 유저(login()파라미터)가 같은지 확인
    if (email !== invitedEmail) {
      console.log(email, invitedEmail);
      throw new BadRequestException('로그인한 유저와 초대된 유저가 다릅니다');
    }
    return await this.addUserToWorkspace(userId, workspaceId, uniqueToken);
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

    // WorkspaceMember 저장
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspaceMember.nickname = user.name; // 구글 로그인 이름 넣기
    console.log('fr: 초대할 워크스페이스 멤버: ', workspaceMember);
    try {
      await this.workspaceMemberRepo.insert(workspaceMember);
      console.log('workspaceMemberRepo에 추가 성공!');
    } catch (err) {
      throw new ConflictException('이미 워크스페이스에 초대되었습니다');
    }

    // Workspace 업데이트
    await this.workspaceRepo.update(workspaceId, {
      memberCount: () => 'memberCount + 1',
    });

    // workspaceInvitation 업데이트
    const invitation = await this.invitationRepo.findOne({
      where: { uniqueToken: uniqueToken },
    });
    if (!invitation) {
      throw new NotFoundException('해당 초대를 찾을 수 없습니다');
    }
    await this.invitationRepo.update(invitation.id, {
      status: InvitationStatus.ACCEPTED,
    });

    return workspaceMember;
  }

  // 해당 워크스페이스에서 내 정보
  async getMyInfo(userId: number, workspaceId: number) {
    console.log('fr: ', userId);
    const user = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .innerJoinAndSelect('workspaceMember.member', 'user', 'user.id = :id', {
        id: userId,
      })
      .select('user.id', 'userId')
      .addSelect('user.imgUrl', 'imgUrl')
      .addSelect('workspaceMember.nickname', 'nickname')
      .getRawOne();

    return user;
  }

  // 내가 멤버로 속해있는 워크스페이스 조회
  async findMyWorkspaces(userId: number) {
    const workspaces = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoin('workspaceMember.workspace', 'workspace')
      .select(['workspace.id', 'workspace.name', 'workspace.imgUrl'])
      .where('workspaceMember.member.id = :userId', { userId: userId })
      .orderBy('workspace.id', 'ASC')
      .getRawMany();

    return workspaces;
  }

  async getCurrentWorkspace(workspaceId: number) {
    const workspace = await this.workspaceRepo
      .createQueryBuilder('workspace')
      .select(['workspace.id', 'workspace.name', 'workspace.imgUrl'])
      .where('workspace.id = :id', { id: workspaceId })
      .getOne();

    return workspace;
  }

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
      .addSelect('workspaceMember.nickname', 'nickname')
      .addSelect('workspaceMember.admin', 'admin')
      .orderBy('workspaceMember.admin', 'DESC');

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

  // 관리자 권한 추가
  async addAdminToWorkspace(workspaceId: number, userId: number) {
    const workspaceMember = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .andWhere('workspaceMember.userId = :userId', { userId: userId })
      .getOne();

    if (!workspaceMember) {
      throw new NotFoundException(
        '해당 유저는 워크스페이스에 속해있지 않습니다',
      );
    }

    workspaceMember.admin = true;
    await this.workspaceMemberRepo.save(workspaceMember);
    return workspaceMember;
  }

  // 관리자 권한 삭제

  // 닉네임 검색
  async searchMembers(workspaceId: number, query: string) {
    const availableUsers = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .innerJoin('workspaceMember.member', 'user')
      .select(['user.id', 'user.imgUrl'])
      .addSelect('workspaceMember.nickname', 'nickname')
      .where('workspaceMember.nickname LIKE :query', { query: `%${query}%` })
      .getRawMany();

    return availableUsers;
  }

  // 워크스페이스내 유저 프로필 변경
  //
  async updateUserProfile(
    userId: number,
    workspaceId: number,
    name?: string,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.imgUrl = file
      ? `${process.env.SERVER_DOMAIN}/public/uploads/user/${file.filename}`
      : user.imgUrl;
    await this.userRepo.save(user);

    // 닉네임을 변경할 경우
    if (name) {
      // 워크스페이스에서 사용할 닉네임 변경
      const workspaceMemberId = await this.workspaceMemberRepo
        .createQueryBuilder('workspaceMember')
        .select('workspaceMember.id')
        .where('workspaceMember.workspace.id = :workspaceId', {
          workspaceId: workspaceId,
        })
        .andWhere('workspaceMember.member.id = :userId', { userId: userId })
        .getOne();

      console.log(workspaceMemberId);
      try {
        await this.workspaceMemberRepo.update(workspaceMemberId, {
          nickname: name,
        });
        return {
          message: `사용자[${userId}]이 워크스페이스[${workspaceId}]의 닉네임을 "${name}"로 변경하였습니다.`,
        };
      } catch (err) {
        console.error(err);
        throw new Error('workspaceMember 업데이트 실패');
      }
    }
    return { res: '이미지 업로드에 성공하였습니다' };
  }

  // 워크스페이스 삭제
  async deleteWorkspace(userId: number, workspaceId: number) {
    // 멤버 삭제 후 워크스페이스 삭제
    // await this.deleteWorkspaceMembrer(workspaceId, userId);
    console.log('fr: workspaceId', workspaceId);
    return await this.workspaceRepo
      .createQueryBuilder('workspace')
      .softDelete()
      .where('id = :id', { id: workspaceId })
      .execute();
  }

  async deleteWorkspaceMembrer(workspaceId: number, userId: number) {
    // user를 workspace-member 테이블에서 삭제
    await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .delete()
      .where('userId = :userId', { userId: userId })
      .andWhere('workspaceId = :workspaceId', { workspaceId: workspaceId })
      .execute();

    // workspace memberCount -1
    await this.workspaceRepo.update(workspaceId, {
      memberCount: () => 'memberCount - 1',
    });
    return { deleted_member: userId };
  }

  // 워크스페이스 나가기
  async leaveWorkspace(userId: number, workspaceId: number) {
    const workspace = await this.workspaceRepo
      .createQueryBuilder('workspace')
      .where('workspace.id = :workspaceId', { workspaceId: workspaceId })
      .andWhere('workspace.host = :userId', { userId: userId })
      .getOne();

    // 1. user가 host인 경우
    if (workspace) {
      const adminList = await this.workspaceMemberRepo
        .createQueryBuilder('workspaceMember')
        .select('workspaceMember.userId')
        .where('workspaceMember.workspaceId = :workspaceId', {
          workspaceId: workspaceId,
        })
        .andWhere('workspaceMember.admin = true')
        .getRawMany();

      // Admin.length > 1
      if (adminList.length > 1) {
        console.log('fr: Admin.length > 1');
        /******************************** 특수 case - 내가 host일 때 *******************************/
        const adminIds = adminList.map((item) => item.userId);
        // 현재 userId를 배열에서 제외.
        const filteredAdminIds = adminIds.filter((id) => id !== userId); // 이미 제외되어있을 것.

        // host를 admin 첫 원소로 이관
        const newhostId = filteredAdminIds[0];
        const newhost = await this.userRepo.findOne({
          where: { id: newhostId },
        });
        await this.workspaceRepo.update(workspaceId, { host: newhost });
        /******************************** 특수 case - 내가 host일 때 *******************************/

        // host user를 workspace-member 테이블에서 삭제
        console.log('fr: Host leaved');
        const deleted_member = await this.deleteWorkspaceMembrer(
          workspaceId,
          userId,
        );

        return { deleted_member, newhost };
      }
      // Admin.length == 1 이면 에러 메시지 전송
      // 팝업창을 띄운 후 확인버튼 누르면 삭제 API 실행
      throw new HttpException(
        `워크스페이스 관리자가 남아있지 않습니다. 정말로 나가시겠습니까? 워크스페이스내 모든 데이터가 사라집니다.`,
        HttpStatus.CONFLICT,
      );
    }

    const workspaceWhereIamAdmin = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .select('workspaceMember.userId')
      .innerJoinAndSelect(
        'workspaceMember.workspace',
        'workspace',
        'workspace.id = :workspaceId',
        { workspaceId: workspaceId },
      )
      .andWhere('workspaceMember.userId = :userId', { userId: userId })
      .andWhere('workspaceMember.admin = true')
      .getRawOne();

    console.log('userId', userId);
    console.log('workspaceWhereIamAdmin', workspaceWhereIamAdmin);

    // 2. user가 host는 아니지만 admin인 경우
    if (workspaceWhereIamAdmin) {
      console.log('fr: I am Admin, not a Host');
      const adminList = await this.workspaceMemberRepo
        .createQueryBuilder('workspaceMember')
        .select('workspaceMember.userId')
        .where('workspaceMember.workspaceId = :workspaceId', {
          workspaceId: workspaceId,
        })
        .andWhere('workspaceMember.admin = true')
        .getRawMany();

      // Case 1. Admin.length > 1
      if (adminList.length > 1) {
        console.log('fr: Admin leaved');
        return await this.deleteWorkspaceMembrer(workspaceId, userId);
      }
      // Case 2. not: 내가 마지막 admin. (위의 host case일 수밖에)
      throw new HttpException(
        `워크스페이스 관리자가 남아있지 않습니다. 정말로 나가시겠습니까?\
        워크스페이스내 모든 데이터가 사라집니다.`,
        HttpStatus.CONFLICT,
      );
    }
    // 3. 일반 user
    console.log('fr: general user leaved');
    return await this.deleteWorkspaceMembrer(workspaceId, userId);
  }
}
