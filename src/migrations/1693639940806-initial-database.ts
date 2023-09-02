import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabase1693639940806 implements MigrationInterface {
  name = 'InitialDatabase1693639940806';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Group" ("id" SERIAL NOT NULL, "name" character varying(127) NOT NULL, "memberCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "workspaceId" integer, "creator" integer, CONSTRAINT "PK_d064bd160defed65823032ee547" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workspace_invitation" ("id" SERIAL NOT NULL, "uniqueToken" character varying NOT NULL, "email" character varying(127) NOT NULL, "status" "public"."workspace_invitation_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "workspaceId" integer, CONSTRAINT "PK_8d58734b72dc04a88ff86fab9dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc55d4b5cd277e090514b9fcd9" ON "workspace_invitation" ("uniqueToken") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workspace_member" ("id" SERIAL NOT NULL, "nickname" character varying(127), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "workspaceId" integer, "userId" integer, CONSTRAINT "UQ_WORKSPACE_MEMBER" UNIQUE ("workspaceId", "userId"), CONSTRAINT "PK_a3a35f64bf30517010551467c6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Workspace" ("id" SERIAL NOT NULL, "name" character varying(127) NOT NULL, "imgUrl" character varying(511), "memberCount" integer NOT NULL DEFAULT '1', "invitationCount" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "host" integer, CONSTRAINT "PK_e731dd2fccf32e94db1edecbb2c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Favorites" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "workspaceId" integer, "source" integer, "target" integer, CONSTRAINT "UQ_FAVORITE" UNIQUE ("workspaceId", "source", "target"), CONSTRAINT "PK_83cd0162b05b05e9a88cb3e5ad0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "User" ("id" SERIAL NOT NULL, "name" character varying(127) NOT NULL, "email" character varying(127) NOT NULL, "googleId" character varying(127) NOT NULL DEFAULT '', "imgUrl" character varying(255), "phone" character varying(127), "token" character varying(511), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Comment" ("id" SERIAL NOT NULL, "text" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "taskId" integer, "userId" integer, CONSTRAINT "PK_fe8d6bf0fcb531dfa75f3fd5bdb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Task" ("id" SERIAL NOT NULL, "title" character varying(511) NOT NULL, "commentCount" integer NOT NULL DEFAULT '0', "priority" integer NOT NULL DEFAULT '0', "status" boolean NOT NULL DEFAULT false, "scheduleDate" date NOT NULL DEFAULT now(), "dueDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, "workspaceId" integer, CONSTRAINT "PK_95d9364b8115119ba8b15a43592" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Alarm" ("id" SERIAL NOT NULL, "status" "public"."Alarm_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "target" integer, "task" integer, "source" integer, CONSTRAINT "PK_d7ec9eac1eddb664ffffa0c62a3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_member" ("groupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_0b4af14c22502d5f24bf2a89bd2" PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44c8964c097cf7f71434d6d112" ON "group_member" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f209c217eef89b8c32bd07790" ON "group_member" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "Group" ADD CONSTRAINT "FK_5a7c50e42f543b2226c46da1946" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Group" ADD CONSTRAINT "FK_6883d513f2f35762f2eed6659ab" FOREIGN KEY ("creator") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_invitation" ADD CONSTRAINT "FK_c060076f1277c3c957151ec1321" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_03ce416ae83c188274dec61205c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Workspace" ADD CONSTRAINT "FK_0c249b25334ab4cacc032ea3115" FOREIGN KEY ("host") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" ADD CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" ADD CONSTRAINT "FK_3d88eb112081e9b54a314a00c77" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" ADD CONSTRAINT "FK_59d1bba41815954f5d3d269e47f" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comment" ADD CONSTRAINT "FK_ba0e26b34832df41bb9edade941" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comment" ADD CONSTRAINT "FK_4c827119c9554affb8018d4da82" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Task" ADD CONSTRAINT "FK_b9a04beac0d49f34e711895715c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Task" ADD CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" ADD CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" ADD CONSTRAINT "FK_19ff0153f97f4912ee3120e166a" FOREIGN KEY ("task") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" ADD CONSTRAINT "FK_048593aba3bf2517830382caf87" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD CONSTRAINT "FK_44c8964c097cf7f71434d6d1122" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" ADD CONSTRAINT "FK_9f209c217eef89b8c32bd077903" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member" DROP CONSTRAINT "FK_9f209c217eef89b8c32bd077903"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member" DROP CONSTRAINT "FK_44c8964c097cf7f71434d6d1122"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" DROP CONSTRAINT "FK_048593aba3bf2517830382caf87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" DROP CONSTRAINT "FK_19ff0153f97f4912ee3120e166a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Alarm" DROP CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Task" DROP CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Task" DROP CONSTRAINT "FK_b9a04beac0d49f34e711895715c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comment" DROP CONSTRAINT "FK_4c827119c9554affb8018d4da82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comment" DROP CONSTRAINT "FK_ba0e26b34832df41bb9edade941"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" DROP CONSTRAINT "FK_59d1bba41815954f5d3d269e47f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" DROP CONSTRAINT "FK_3d88eb112081e9b54a314a00c77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Favorites" DROP CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Workspace" DROP CONSTRAINT "FK_0c249b25334ab4cacc032ea3115"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_03ce416ae83c188274dec61205c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_invitation" DROP CONSTRAINT "FK_c060076f1277c3c957151ec1321"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Group" DROP CONSTRAINT "FK_6883d513f2f35762f2eed6659ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Group" DROP CONSTRAINT "FK_5a7c50e42f543b2226c46da1946"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9f209c217eef89b8c32bd07790"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44c8964c097cf7f71434d6d112"`,
    );
    await queryRunner.query(`DROP TABLE "group_member"`);
    await queryRunner.query(`DROP TABLE "Alarm"`);
    await queryRunner.query(`DROP TABLE "Task"`);
    await queryRunner.query(`DROP TABLE "Comment"`);
    await queryRunner.query(`DROP TABLE "User"`);
    await queryRunner.query(`DROP TABLE "Favorites"`);
    await queryRunner.query(`DROP TABLE "Workspace"`);
    await queryRunner.query(`DROP TABLE "workspace_member"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc55d4b5cd277e090514b9fcd9"`,
    );
    await queryRunner.query(`DROP TABLE "workspace_invitation"`);
    await queryRunner.query(`DROP TABLE "Group"`);
  }
}
