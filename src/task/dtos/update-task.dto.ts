import { IsNumber, IsOptional } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
