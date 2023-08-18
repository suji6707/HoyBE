import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/user.dto';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('google/callback/:uniqueToken')
  async receiveGoogleCallbackWithToken(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Param('uniqueToken') uniqueToken?: string,
  ) {
    // 구글 credential 정보
    const { credential } = loginDto;

    // login에서 JWT 토큰 반환
    const jwtToken = await this.authService.login(credential, uniqueToken);
    // return res.json(jwtToken);
    // 쿠키 설정
    // res.cookie('ACCESS_KEY', jwtToken.access_token, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24 * 7,
    //   domain: 'localhost',
    // });
    res.redirect(
      `http://localhost:3000/login?access_token=${jwtToken.access_token}`,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('google/callback')
  async receiveGoogleCallback(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Param('uniqueToken') uniqueToken?: string,
  ) {
    // 구글 credential 정보
    const { credential } = loginDto;

    // login에서 JWT 토큰 반환
    const jwtToken = await this.authService.login(credential, uniqueToken);
    res.redirect(
      `http://localhost:3000/login?access_token=${jwtToken.access_token}`,
    );
  }
}
