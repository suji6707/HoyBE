import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkspaceOndelete1693990357952 implements MigrationInterface {
    name = 'WorkspaceOndelete1693990357952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Workspace" DROP CONSTRAINT "FK_0c249b25334ab4cacc032ea3115"`);
        await queryRunner.query(`ALTER TABLE "Workspace" ADD CONSTRAINT "FK_0c249b25334ab4cacc032ea3115" FOREIGN KEY ("host") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Workspace" DROP CONSTRAINT "FK_0c249b25334ab4cacc032ea3115"`);
        await queryRunner.query(`ALTER TABLE "Workspace" ADD CONSTRAINT "FK_0c249b25334ab4cacc032ea3115" FOREIGN KEY ("host") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
