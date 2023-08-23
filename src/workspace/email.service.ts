import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async isEmailInvitable(workspaceId: number, email: string) {
    const user = await this.workspaceMemberRepo
      .createQueryBuilder('workspaceMember')
      .innerJoinAndSelect('workspaceMember.member', 'user')
      .where('user.email = :email', { email: email })
      .andWhere('workspaceMember.workspace.id = :workspaceId', {
        workspaceId: workspaceId,
      })
      .getOne();

    if (user) {
      throw new ConflictException('해당 워크스페이스에 이미 초대된 멤버입니다');
    }
  }

  public async sendEmail(workspaceId: number, emails: string[]): Promise<void> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('존재하지 않는 워크스페이스입니다');
    }
    // 해당 워크스페이스 초대 횟수 체크
    if (workspace.invitationCount > 20) {
      throw new Error(
        '초대 가능 인원을 초과하였습니다. Hoy 팀과 미팅 일정을 잡으셔서 더 많은 유저를 초대해보세요!',
      );
    }
    for (const email of emails) {
      // 이미 초대된 멤버인지 확인
      const user = await this.workspaceMemberRepo
        .createQueryBuilder('workspaceMember')
        .innerJoinAndSelect('workspaceMember.member', 'user')
        .where('user.email = :email', { email: email })
        .andWhere('workspaceMember.workspace.id = :workspaceId', {
          workspaceId: workspaceId,
        })
        .getOne();

      if (user) {
        // invitation 로직을 실행하지 않음
        console.log('해당 워크스페이스에 이미 초대된 멤버입니다');
        continue;
      }

      // 토큰/Unique ID
      const payload = { workspaceId: workspaceId, email: email };
      const uniqueToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });
      // 초대 내역 저장
      const workspaceInvitation = new WorkspaceInvitation();
      workspaceInvitation.workspace = workspace;
      workspaceInvitation.email = email;
      workspaceInvitation.uniqueToken = uniqueToken;
      await this.invitationRepo.insert(workspaceInvitation);

      // 링크 생성. 아래 도메인 GET 요청으로
      // 1. hoy.im 사이트 이동 및 구글 로그인
      // 2. accept 절차 진행

      // 클라이언트 - login/:uniqueToken 이 로컬스토리지에 저장돼있으면
      const invitationLink = `${process.env.DOMAIN}/login?uniqueToken=${uniqueToken}`;
      console.log('fr: 이메일 초대링크: ', invitationLink);

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
    // 워크스페이스 invitationCount
    await this.workspaceRepo.update(workspaceId, {
      invitationCount: () => `invitationCount + ${emails.length}`,
    });
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
