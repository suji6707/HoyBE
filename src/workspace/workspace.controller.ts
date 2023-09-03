import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from 'src/auth.guard';
import { CreateWorkspaceDto } from './dtos/create-workspace.dto';
import { SendEmailDto } from './dtos/email-invitations.dto';
import { EmailService } from './email.service';
import { AcceptInvitationDto } from './dtos/accpet-invitation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { WorkspaceGuard } from 'src/workspace.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller('workspace')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private readonly emailService: EmailService,
  ) {}

  // 워크스페이스 생성 (및 해당 유저 추가)
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'workspace',
        ), // '../../public/uploads'
        filename: (req, file, callback) => {
          const userId = (req as any).userId;
          const extension = path.extname(file.originalname);
          const filename = `${Date.now()}-user${userId}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async createWorkspace(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    const userId = req.userId;

    if (file) {
      console.log('fr: 워크스페이스 이미지 업로드: ', file);
    }
    // workspace 함수에 file 인자로 같이 전달하기. 안에서는 undefined가 아닐 경우 imgUrl에 넣고.
    return await this.workspaceService.createWorkspace(
      userId,
      createWorkspaceDto,
      file,
    );
  }

  // 내 워크스페이스 조회
  @UseGuards(AuthGuard)
  @Get()
  async findMyWorkspaces(@Req() req) {
    const userId = req.userId;
    return await this.workspaceService.findMyWorkspaces(userId);
  }

  // 내 워크스페이스 조회
  @UseGuards(AuthGuard)
  @Get(':workspaceId')
  async getCurrentWorkspace(@Param('workspaceId') workspaceId: number) {
    return await this.workspaceService.getCurrentWorkspace(workspaceId);
  }

  // 해당 워크스페이스에서 내 정보 (sidebar)
  @UseGuards(AuthGuard)
  @Get(':workspaceId/current-user')
  async getMyInfo(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.workspaceService.getMyInfo(userId, workspaceId);
  }

  // 초대가능 이메일인지 확인
  @UseGuards(AuthGuard)
  @Post(':workspaceId/invitations/availability')
  async isEmailInvitable(
    @Param('workspaceId') workspaceId: number,
    @Body('email') email: string,
  ) {
    console.log('email 들어왔는지', email);
    const regrex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = regrex.test(email);
    if (!isValidEmail) {
      throw new BadRequestException('유효하지 않은 이메일 주소입니다');
    }
    return this.emailService.isEmailInvitable(workspaceId, email);
  }

  // 이메일로 워크스페이스 초대
  @UseGuards(AuthGuard)
  @Post(':workspaceId/invitations')
  async sendEmail(
    @Param('workspaceId') workspaceId: number,
    @Body() sendEmailDto: SendEmailDto,
  ) {
    return await this.emailService.sendEmail(workspaceId, sendEmailDto.emails);
  }

  @UseGuards(AuthGuard)
  @Post('accept-invitation')
  async acceptInvitation(
    @Req() req,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    const userId = req.userId;
    const { uniqueToken, email } = acceptInvitationDto;
    console.log('fr:  uniqueToken, email', uniqueToken, email);
    return await this.workspaceService.acceptInvitaion(
      uniqueToken,
      email,
      userId,
    );
  }

  // 워크스페이스내 유저 프로필 변경 (이미지는 전체, 이름은 워크스페이스 한정)
  // 이름은 body에 없으면 기본 이름으로 변경 안하도록 함.
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post(':workspaceId/user-account/profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'user',
        ),
        filename: (req, file, callback) => {
          const userId = (req as any).userId;
          const extension = path.extname(file.originalname);
          const filename = `${Date.now()}-user${userId}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async updateUserProfile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req,
    @Param('workspaceId') workspaceId: number,
    @Body('name') name?: string,
  ) {
    const userId = req.userId;

    if (file) {
      console.log('fr: 설정창 유저 이미지 업로드: ', file);
    }

    return await this.workspaceService.updateUserProfile(
      userId,
      workspaceId,
      name,
      file,
    );
  }

  // 개인 프로필 페이지
  // 계정 버튼 눌렀을 때 user.imgUrl 및 workspace_member.nickname 주기
  // workspaceId, userId 있어야 함
  // @UseGuards(AuthGuard, WorkspaceGuard)
  // @Get(':workspaceId/user-account')

  // 워크스페이스 삭제 -> 팝업창 확인 눌렀을 때
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Delete(':workspaceId')
  async deleteWorkspace(@Req() req, @Param('workspaceId') workspaceId: number) {
    console.log('fr: workspaceId', workspaceId);

    const userId = req.userId;
    return await this.workspaceService.deleteWorkspace(userId, workspaceId);
  }

  // '나가기' & adminCount -> admin이 2 이상이면 member 테이블 삭제.
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':workspaceId/leave')
  async leaveWorkspace(@Req() req, @Param('workspaceId') workspaceId: number) {
    const userId = req.userId;
    return await this.workspaceService.leaveWorkspace(userId, workspaceId);
  }

  // 워크스페이스 관리자 조회
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Get(':workspaceId/account/members')
  async getAvailableUsers(@Param('workspaceId') workspaceId: number) {
    // getAvailableUsers
    const availableUsers = await this.workspaceService.getAvailableUsers(
      workspaceId,
    );
    return availableUsers;
  }

  // 관리자 권한 추가
  @UseGuards(AuthGuard, WorkspaceGuard)
  @Post(':workspaceId/account/admin/:userId')
  async addAdminToWorkspace(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
  ) {
    return await this.workspaceService.addAdminToWorkspace(workspaceId, userId);
  }

  // // 관리자 권한 삭제
  // @UseGuards(AuthGuard, WorkspaceGuard)
  // @Delete(':workspaceId/account/admin/:userId')

  // @Post('test')
  // async test() {
  //   return await this.workspaceService.acceptInvitaion(
  //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VJZCI6IjEiLCJlbWFpbCI6Imhlb2ppc3U2NzA3QGdtYWlsLmNvbSIsImlhdCI6MTY5MjcyMDMxMywiZXhwIjoxNjkyNzIwMzQzfQ.tN2sZgGeilaZy_HDQE2trWofmmAphrWN4l-m-1q_bOg',
  //     'heojisu6707@gmail.com',
  //     1,
  //   );
  // }
}
