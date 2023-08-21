import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateGroupDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  addMemberIds?: number[];

  @IsOptional()
  @IsArray()
  removeMemberIds?: number[];
}
