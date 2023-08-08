import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from './dtos/user.dto';
import { AuthException } from './exceptions/AuthException';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    // 1. Check if user already exist
    const storedUser = this.userRepo.findOne({
      where: { email: signupDto.email },
    });
    if (storedUser) {
      throw new AuthException('이미 가입한 이메일입니다.', HttpStatus.CONFLICT);
    }
    // 2. Encrypt user password
    const hashedPassword = await argon.hash(signupDto.password);

    // 3. Create user in our database
    const user = new User();
    user.email = signupDto.email;
    user.password = hashedPassword;
    user.name = signupDto.name;
    user.phone = signupDto.phone;
  }
}
