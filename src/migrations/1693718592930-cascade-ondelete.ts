import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeOndelete1693718592930 implements MigrationInterface {
    name = 'CascadeOndelete1693718592930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Group" DROP CONSTRAINT "FK_5a7c50e42f543b2226c46da1946"`);
        await queryRunner.query(`ALTER TABLE "Group" DROP CONSTRAINT "FK_6883d513f2f35762f2eed6659ab"`);
        await queryRunner.query(`ALTER TABLE "workspace_invitation" DROP CONSTRAINT "FK_c060076f1277c3c957151ec1321"`);
        await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede"`);
        await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_03ce416ae83c188274dec61205c"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_e42cf893de420fe6cde2815682c"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_fc4f9c1652638ebd02530d91c9c"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_3d88eb112081e9b54a314a00c77"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_59d1bba41815954f5d3d269e47f"`);
        await queryRunner.query(`ALTER TABLE "Comment" DROP CONSTRAINT "FK_4c827119c9554affb8018d4da82"`);
        await queryRunner.query(`ALTER TABLE "Task" DROP CONSTRAINT "FK_b9a04beac0d49f34e711895715c"`);
        await queryRunner.query(`ALTER TABLE "Task" DROP CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_048593aba3bf2517830382caf87"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" RENAME COLUMN "userId" TO "admin"`);
        await queryRunner.query(`ALTER TABLE "Group" ADD CONSTRAINT "FK_5a7c50e42f543b2226c46da1946" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Group" ADD CONSTRAINT "FK_6883d513f2f35762f2eed6659ab" FOREIGN KEY ("creator") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_invitation" ADD CONSTRAINT "FK_c060076f1277c3c957151ec1321" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_03ce416ae83c188274dec61205c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_e42cf893de420fe6cde2815682c" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_f96d90de99e3d77a716d7e27d31" FOREIGN KEY ("admin") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_3d88eb112081e9b54a314a00c77" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_59d1bba41815954f5d3d269e47f" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comment" ADD CONSTRAINT "FK_4c827119c9554affb8018d4da82" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Task" ADD CONSTRAINT "FK_b9a04beac0d49f34e711895715c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Task" ADD CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_048593aba3bf2517830382caf87" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_048593aba3bf2517830382caf87"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27"`);
        await queryRunner.query(`ALTER TABLE "Task" DROP CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941"`);
        await queryRunner.query(`ALTER TABLE "Task" DROP CONSTRAINT "FK_b9a04beac0d49f34e711895715c"`);
        await queryRunner.query(`ALTER TABLE "Comment" DROP CONSTRAINT "FK_4c827119c9554affb8018d4da82"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_59d1bba41815954f5d3d269e47f"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_3d88eb112081e9b54a314a00c77"`);
        await queryRunner.query(`ALTER TABLE "Favorites" DROP CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_f96d90de99e3d77a716d7e27d31"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_e42cf893de420fe6cde2815682c"`);
        await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_03ce416ae83c188274dec61205c"`);
        await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede"`);
        await queryRunner.query(`ALTER TABLE "workspace_invitation" DROP CONSTRAINT "FK_c060076f1277c3c957151ec1321"`);
        await queryRunner.query(`ALTER TABLE "Group" DROP CONSTRAINT "FK_6883d513f2f35762f2eed6659ab"`);
        await queryRunner.query(`ALTER TABLE "Group" DROP CONSTRAINT "FK_5a7c50e42f543b2226c46da1946"`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" RENAME COLUMN "admin" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_048593aba3bf2517830382caf87" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Task" ADD CONSTRAINT "FK_dfb27dba36e3d60b8b1a09da941" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Task" ADD CONSTRAINT "FK_b9a04beac0d49f34e711895715c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comment" ADD CONSTRAINT "FK_4c827119c9554affb8018d4da82" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_59d1bba41815954f5d3d269e47f" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_3d88eb112081e9b54a314a00c77" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Favorites" ADD CONSTRAINT "FK_df97eca08adb65109f6c5ac30c0" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_fc4f9c1652638ebd02530d91c9c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_e42cf893de420fe6cde2815682c" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_03ce416ae83c188274dec61205c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_15b622cbfffabc30d7dbc52fede" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_invitation" ADD CONSTRAINT "FK_c060076f1277c3c957151ec1321" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Group" ADD CONSTRAINT "FK_6883d513f2f35762f2eed6659ab" FOREIGN KEY ("creator") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Group" ADD CONSTRAINT "FK_5a7c50e42f543b2226c46da1946" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
