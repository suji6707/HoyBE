import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, SignupDto } from './dtos/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    console.log(body);
    const { email, givenName, imgUrl } = body;
    return this.authService.login(email, givenName, imgUrl);
  }
}
