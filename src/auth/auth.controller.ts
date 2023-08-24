import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import 'dotenv/config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('google/callback')
  async receiveGoogleCallback(
    @Body() loginDto: LoginDto, // Body에 uniqueToken 추가
    @Res() res: Response,
  ) {
    // 구글 credential 정보
    const { credential } = loginDto;

    // login에서 JWT 토큰 반환
    const { access_token, email } = await this.authService.login(credential);
    console.log(`${process.env.DOMAIN}`);
    res.redirect(
      `${process.env.DOMAIN}/login?access_token=${access_token}&email=${email}`, // 배포 버전에선 vercel 주소로
    );
  }
}
