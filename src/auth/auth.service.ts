import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import 'dotenv/config';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { error } from 'console';
import { WorkspaceService } from 'src/workspace/workspace.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private workspaceService: WorkspaceService,
  ) {}

  async login(credential: string) {
    // googleId, email, name, imgUrl 변수에 담는다
    const result = await this.getDecodedJwtGoogle(credential);
    const googlePayload = (result as LoginTicket).getPayload();
    const googleId = googlePayload.sub;
    const email = googlePayload.email;
    const name = googlePayload.name;
    const imgUrl = googlePayload.picture;
    console.log(googleId, email, name, imgUrl);

    const storedUser = await this.userRepo.findOne({
      where: { googleId: googleId },
    });

    let userId;
    // googleId가 존재하지 않을 때: Create user in our database
    if (!storedUser) {
      const user = new User();
      user.googleId = googleId;
      user.email = email;
      user.name = name;
      user.imgUrl = imgUrl;
      const savedUser = await this.userRepo.save(user);
      userId = savedUser.id;
    } else {
      // 존재할 때: access_token만 저장
      userId = storedUser.id;
    }
    // JWT 토큰 생성
    const payload = { sub: userId };
    const access_token = await this.jwtService.signAsync(payload);

    // user 객체에 token값 업데이트
    await this.userRepo.update(userId, { token: access_token });

    // 클라이언트에 토큰 반환
    return { access_token: access_token, email: email };
  }

  async getDecodedJwtGoogle(token: string) {
    const CLIENT_ID_GOOGLE = process.env.CLIENT_ID_GOOGLE;

    try {
      const client = new OAuth2Client(CLIENT_ID_GOOGLE);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID_GOOGLE,
      });
      return ticket;
    } catch (err) {
      return { status: 500, data: error };
    }
  }
}
