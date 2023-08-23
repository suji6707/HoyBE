import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  credential: string;
}
