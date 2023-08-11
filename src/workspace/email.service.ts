import { Injectable, Param } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

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

  public async sendEmail(email: string): Promise<void> {
    // 토큰/Unique ID

    // 초대 내역 저장

    // 링크 생성

    this.mailerService
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
