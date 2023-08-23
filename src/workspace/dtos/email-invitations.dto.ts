import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
