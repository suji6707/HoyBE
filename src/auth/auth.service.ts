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

    const dto = new LoginDto();
    dto.email = signupDto.email;
    dto.password = signupDto.password;

    return user;
    // return await this.login(dto); // 자동 로그인 라우팅
  }

  async login(email, givenName, imgUrl) {
    const storedUser = await this.userRepo.findOne({
      where: { email: email },
    });
    // email 존재하지 않을 때: Create user in our database
    if (!storedUser) {
      const user = new User();
      user.email = email;
      user.name = givenName;
      user.imgUrl = imgUrl;

      const savedUser = await this.userRepo.save(user);
      // 방금 저장한 유저의 User.id 가져오기
      const userId = savedUser.id;

      const payload = { sub: userId };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
    // 2. email 존재할 때
    const payload = { sub: storedUser.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
