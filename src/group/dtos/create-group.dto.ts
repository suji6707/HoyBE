import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  memberIds: number[]; // 프론트에서 userId로 받도록
}
