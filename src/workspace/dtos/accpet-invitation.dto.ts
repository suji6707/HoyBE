import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @IsNotEmpty()
  uniqueToken: string;

  @IsString()
  email: string;
}
