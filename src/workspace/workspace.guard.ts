import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from './entity/workspace_member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    private workspaceService: WorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId;
    const workspaceId = Number(request.params.workspaceId);

    // 해당 워크스페이스 조회
    const workspace = await this.workspaceService.findWorkspaceById(
      workspaceId,
    );
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }

    // 해당 워크스페이스 멤버 목록에 userId가 포함되어있는지 확인
    const isMember = await this.workspaceMemberRepo.findOne({
      where: { member: { id: userId } },
    });
    // const isMember = workspace.members.some((member) => member.id == userId);

    if (!isMember) {
      throw new UnauthorizedException('You are not a member of this workspace');
    }

    console.log('fr: WorkspaceGuard 통과');
    return true;
  }
}
