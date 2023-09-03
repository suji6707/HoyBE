import 'dotenv/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const MailerConfig: MailerOptions = {
  transport: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  },
  defaults: {
    from: '"nest-modules" <modules@nestjs.com>',
  },
  template: {
    dir: process.cwd() + '/templates/',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
