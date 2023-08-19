import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkspaceMember } from './workspace/entity/workspace_member.entity';
import { Repository } from 'typeorm';
import { Workspace } from './workspace/entity/workspace.entity';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId;
    const workspaceId = Number(request.params.workspaceId);

    // 해당 워크스페이스 조회
    const workspace = await this.findWorkspaceById(workspaceId);
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }

    // 해당 워크스페이스 멤버 목록에 userId가 포함되어있는지 확인
    const isMember = await this.workspaceMemberRepo.findOne({
      where: { member: { id: userId } },
    });

    if (!isMember) {
      throw new UnauthorizedException('You are not a member of this workspace');
    }

    console.log('fr: WorkspaceGuard 통과');
    return true;
  }

  private async findWorkspaceById(workspaceId: number) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    return workspace;
  }
}
