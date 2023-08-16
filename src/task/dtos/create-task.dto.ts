import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNumber()
  priority: number;

  @IsOptional()
  @IsBoolean()
  status: boolean;
}
