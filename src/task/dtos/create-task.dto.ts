import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  title: string;

  @IsNumber()
  priority: number;

  @IsBoolean()
  status: boolean;
}
