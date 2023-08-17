import { Injectable, Param } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';
import { Repository } from 'typeorm';
import 'dotenv/config';
import { User } from 'src/users/entity/user.entity';
import { Workspace } from './entity/workspace.entity';
import { WorkspaceMember } from './entity/workspace_member.entity';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepo: Repository<WorkspaceInvitation>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  public async sendEmail(workspaceId: number, email: string): Promise<void> {
    // 토큰/Unique ID
    const payload = { workspaceId: workspaceId, email: email };
    const uniqueToken = await this.jwtService.signAsync(payload);

    // 해당 워크스페이스 초대 횟수 체크
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });

    if (workspace.invitationCount >= 20) {
      throw new Error(
        '초대 가능 인원을 초과하였습니다. Hoy 팀과 미팅 일정을 잡으셔서 더 많은 유저를 초대해보세요!',
      );
    }

    // 초대 내역 저장
    const workspaceInvitation = new WorkspaceInvitation();
    workspaceInvitation.workspace = workspace;
    workspaceInvitation.email = email; // 비회원이면 User 객체가 없기 때문에 email만 저장하는 걸로 통일
    workspaceInvitation.uniqueToken = uniqueToken;
    await this.invitationRepo.save(workspaceInvitation);

    // 워크스페이스 invitationCount
    workspace.invitationCount += 1;
    await this.workspaceRepo.save(workspace);

    // 링크 생성. 아래 도메인 GET 요청으로
    // 1. hoy.im 사이트 이동 및 구글 로그인
    // 2. accept 절차 진행
    // const invitationLink = `${process.env.DOMAIN}/accept/${uniqueToken}`;
    // const invitationLink = `${process.env.DOMAIN}/testLogin/${workspaceId}`;
    const invitationLink = `${process.env.DOMAIN}/auth/google/callback/${workspaceId}`;

    this.mailerService
      .sendMail({
        to: email,
        from: 'noreply@nestjs.com',
        subject: 'Hoy 워크스페이스로 초대합니다', // 이메일 제목
        text: `Please join our workspace by clicking the link: ${invitationLink}`,
        html: `<p>Please <a href="${invitationLink}">click here</a> to join our workspace.</p>`, // HTML body content
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async addUserToWorkspace(user: User, workspaceId: number) {
    // 필요한 정보들
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });

    // WorkspaceMember 객체 생성
    const workspaceMember = new WorkspaceMember();
    workspaceMember.workspace = workspace;
    workspaceMember.member = user;
    workspaceMember.nickname = user.name; // 구글 로그인 이름 넣기

    // 해당 유저를 member로 추가 (매핑테이블)
    await this.workspaceMemberRepo.save(workspaceMember);

    return workspaceMember;
  }
}

// 1. param으로 uniqueToken 받아서 Jwt -> workspaceId, email 추출.
// User.find (email) -> if (!user) 비회원이면
// login API로 라우팅.
// 1) POST http://localhost:8000/auth/signup 로 라우팅한 후,
// 2) 자동으로 POST http://localhost:8000/auth/login 로그인시킴

// 가입된 유저를 대상으로 아래 절차 진행(위에서 리턴 종료하면 안됨)
// 2. addUser To workspace_member 테이블
// workspace_member 객체 추가.
// 1) workspace, User 각각 workspaceId, email로 find해서 객체 넣기.
// 2) workspaceMember.nickname = User.findOne(email) ->의 name 넣기.

// 3. workspace_invitation 테이블 업데이트
// new () 선언
// workspaceInvitation = invitationRepo.findOne(email)
// workspaceInvitation.status = ACCEPTED (enum 처리)
// invitationRepo.save(workspaceInvitation)

// if (user) {
//   // 이미 존재하는 유저면 addUserToWorkspace() 호출
//   await this.addUserToWorkspace(user, workspaceId);
//   return { success: true };
// } else {
//   // workspaceId를 세션에 저장 후 유저를 로그인으로 리다이렉트
//   return {
//     success: false,
//     url: `${process.env.DOMAIN}/auth/login?workspaceId=${workspaceId}`,
//   };
// }
