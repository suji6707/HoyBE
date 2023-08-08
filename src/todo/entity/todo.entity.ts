import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Todo' })
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column() // 두가지.
  priority: number;

  @Column()
  isDone: boolean;
}
