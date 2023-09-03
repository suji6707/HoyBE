import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeTaskComment1693713476422 implements MigrationInterface {
    name = 'CascadeTaskComment1693713476422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Comment" DROP CONSTRAINT "FK_ba0e26b34832df41bb9edade941"`);
        await queryRunner.query(`ALTER TABLE "Comment" ADD CONSTRAINT "FK_ba0e26b34832df41bb9edade941" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Comment" DROP CONSTRAINT "FK_ba0e26b34832df41bb9edade941"`);
        await queryRunner.query(`ALTER TABLE "Comment" ADD CONSTRAINT "FK_ba0e26b34832df41bb9edade941" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
