import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { GroupModule } from './group/group.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './config/mailer';
import { AppService } from './app.service';
import { CommentModule } from './comment/comment.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AlarmModule } from './alarm/alarm.module';
import 'dotenv/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(TypeOrmConfig),
    UsersModule,
    AuthModule,
    TaskModule,
    WorkspaceModule,
    GroupModule,
    MailerModule.forRoot(MailerConfig),
    CommentModule,
    FavoritesModule,
    AlarmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
