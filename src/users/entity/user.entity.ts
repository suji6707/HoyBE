import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 127 })
  name: string;

  @Column({ length: 127, unique: true }) // 소셜로그인시 unique 제거
  email: string;

  @Column({ length: 127 })
  password: string;

  @Column({ length: 127 })
  phone: string;

  @Column({ length: 255, nullable: true }) // 프로필사진
  imgUrl?: string;

  @Column({ length: 255, unique: true, nullable: true }) // 소셜로그인
  googleId?: string;

  @Column({ length: 511, nullable: true }) // 소셜로그인
  token?: string;
}
