import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    console.log(body);
    // const data = JSON.parse(body);
    const { googleId, email, givenName, imageUrl } = body;
    return this.authService.login(googleId, email, givenName, imageUrl);
  }
}
