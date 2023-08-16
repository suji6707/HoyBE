import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}
}
