import { BadRequestException, Injectable } from '@nestjs/common';
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

  async login(credential: string, uniqueToken?: string) {
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

    let user;
    // googleId가 존재하지 않을 때: Create user in our database
    if (!storedUser) {
      user = new User();
      user.googleId = googleId;
      user.email = email;
      user.name = name;
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

    let workspaceId: number;
    let invitedEmail: string;

    if (uniqueToken) {
      const decoded = await this.jwtService.verifyAsync(uniqueToken);
      workspaceId = decoded.workspaceId;
      invitedEmail = decoded.email;

      // 유저 인증: 실제 로그인 유저(credential. email)과 초대된 유저(login()파라미터)가 같은지 확인
      if (email !== invitedEmail) {
        console.log(email, invitedEmail);
        throw new BadRequestException('로그인한 유저와 초대된 유저가 다릅니다');
      }
      await this.workspaceService.addUserToWorkspace(
        user,
        workspaceId,
        uniqueToken,
      );
    }
    // 클라이언트에 토큰 반환
    return { access_token: access_token };
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
