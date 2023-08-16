import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { EmailService } from 'src/workspace/email.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(googleId, email, givenName, imgUrl, workspaceId?: number) {
    const storedUser = await this.userRepo.findOne({
      where: { googleId: googleId },
    });

    let user;
    // googleId가 존재하지 않을 때: Create user in our database
    if (!storedUser) {
      user = new User();
      user.googleId = googleId;
      user.email = email;
      user.name = givenName;
      user.imgUrl = imgUrl;
      await this.userRepo.save(user);
    } else {
      // 존재할 때: access_token만 저장
      user = storedUser;
    }
    // JWT 토큰 생성
    const payload = { sub: storedUser.id };
    const access_token = await this.jwtService.signAsync(payload);

    // user 객체에 token 저장
    user.token = access_token;
    await this.userRepo.save(user);

    if (workspaceId) {
      await this.emailService.addUserToWorkspace(user, workspaceId);
    }

    // 클라이언트에 토큰 반환
    return { access_token: access_token };
  }
}
