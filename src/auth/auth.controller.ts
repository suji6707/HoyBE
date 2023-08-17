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

  // @HttpCode(HttpStatus.OK)
  // @Post('login')
  // async login(@Body() body: any, @Query('workspaceId') workspaceId?: number) {
  //   console.log(body);
  //   const { credential } = body;
  //   return this.authService.login(credential, workspaceId);
  // }

  @HttpCode(HttpStatus.OK)
  @Post('google/callback/:uniqueToken')
  async receiveGoogleCallback(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Param('uniqueToken') uniqueToken?: string,
  ) {
    // 구글 credential 정보
    const { credential } = loginDto;

    // login에서 JWT 토큰 반환
    const jwtToken = await this.authService.login(credential, uniqueToken);

    // 쿠키 설정 (JavaScript로 접근할 수 없는 HTTP-only 쿠키)
    res.cookie('ACCESS_KEY', jwtToken.access_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: 'localhost',
    });

    res.redirect('http://localhost:3000');
  }
}
