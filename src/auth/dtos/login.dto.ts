import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  credential: string;

  @IsOptional()
  uniqueToken?: string;
}
