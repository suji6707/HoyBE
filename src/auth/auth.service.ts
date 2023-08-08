import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginDto, SignupDto } from './dtos/user.dto';
import { AuthException } from './exceptions/AuthException';
import * as argon from 'argon2';
import { validateEmail } from './validations/email';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<User> {
    // 1. Check if user already exist
    const storedUser = await this.userRepo.findOne({
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

    await this.userRepo.save(user);
    return user; // 로그인 라우팅시 필요
  }

  async login(loginDto: LoginDto) {
    // 1. Validate user input
    if (!validateEmail(loginDto.email)) {
      throw new AuthException(
        '잘못된 이메일 입력입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    // 2. Check if user exist
    const storedUser = await this.userRepo.findOne({
      where: { email: loginDto.email },
    });
    if (!storedUser) {
      throw new AuthException(
        '존재하지 않는 email입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    // 3. Validate password
    const isValidPassword = await argon.verify(
      storedUser.password,
      loginDto.password,
    );
    if (!isValidPassword) {
      throw new AuthException('비밀번호가 틀립니다.', HttpStatus.UNAUTHORIZED);
    }
    // 4. Token issuance
    const payload = { sub: storedUser.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
