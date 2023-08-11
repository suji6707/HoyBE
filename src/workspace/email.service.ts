import { Injectable, Param } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceInvitation } from './entity/workspace_invitations.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(WorkspaceInvitation)
    private invitationRepo: Repository<WorkspaceInvitation>,
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
  ) {}

  // public sendEmail(email: string): void {
  //   this.mailerService
  //     .sendMail({
  //       to: email,
  //       from: 'noreply@nestjs.com',
  //       subject: 'Testing Nest MailerModule',
  //       text: 'Welcome',
  //       html: '<b>welcome</b>', // HTML body content
  //     })
  //     .then((success) => {
  //       console.log(success);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  public async sendEmail(workspaceId: number, email: string): Promise<void> {
    // 토큰/Unique ID
    const payload = { workspaceId: workspaceId, email: email };
    const uniqueToken = await this.jwtService.signAsync(payload);

    // // 초대 내역 저장
    // const invitation = new WorkspaceInvitation();
    // invitation.uniqueToken = uniqueToken;
    // // 아직 비회원이면 email에 해당하는 user가 없는데 어떻게?
    // invitation.invitedUser = await this.invitationRepo.save();

    // 링크 생성

    await this.mailerService
      .sendMail({
        to: email,
        from: 'noreply@nestjs.com',
        subject: 'Testing Nest MailerModule',
        text: 'Welcome',
        html: '<b>welcome</b>', // HTML body content
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async acceptInvitation(@Param('uniqueId') uniqueId: string) {}

  // 컨트롤러: GET('accept/:uniqueId')
}
