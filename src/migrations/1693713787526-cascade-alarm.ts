import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeAlarm1693713787526 implements MigrationInterface {
    name = 'CascadeAlarm1693713787526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_19ff0153f97f4912ee3120e166a"`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_19ff0153f97f4912ee3120e166a" FOREIGN KEY ("task") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_19ff0153f97f4912ee3120e166a"`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_19ff0153f97f4912ee3120e166a" FOREIGN KEY ("task") REFERENCES "Task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
