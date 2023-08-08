import { Body, Controller, Post } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}

  @Post('/sign_kakao')
  async signWithKakao(@Body('token') kakaoToken: string) {}
}
