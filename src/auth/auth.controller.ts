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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @HttpCode(HttpStatus.OK)
  // @Post('login')
  // async login(@Body() body: any, @Query('workspaceId') workspaceId?: number) {
  //   console.log(body);
  //   const { credential } = body;
  //   return this.authService.login(credential, workspaceId);
  // }

  @HttpCode(HttpStatus.OK)
  @Post('google/callback/:workspaceId?')
  async receiveGoogleCallback(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Param('workspaceId') workspaceId?: number,
  ) {
    console.log('fr:', loginDto);
    const { credential } = loginDto;

    // login에서 JWT 토큰 반환
    const jwtToken = await this.authService.login(credential, workspaceId);
    console.log('hi2', jwtToken);
    // 쿠키 설정 (JavaScript로 접근할 수 없는 HTTP-only 쿠키)
    res.cookie('ACCESS_KEY', jwtToken.access_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: 'localhost',
    });
    // res.setCookie
    res.redirect('http://localhost:3000');
    // return jwtToken;
  }
}
