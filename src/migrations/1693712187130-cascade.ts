import { MigrationInterface, QueryRunner } from "typeorm";

export class Cascade1693712187130 implements MigrationInterface {
    name = 'Cascade1693712187130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_19ff0153f97f4912ee3120e166a"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_048593aba3bf2517830382caf87"`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_048593aba3bf2517830382caf87" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_19ff0153f97f4912ee3120e166a" FOREIGN KEY ("task") REFERENCES "Task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_19ff0153f97f4912ee3120e166a"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_048593aba3bf2517830382caf87"`);
        await queryRunner.query(`ALTER TABLE "Alarm" DROP CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27"`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_048593aba3bf2517830382caf87" FOREIGN KEY ("source") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_19ff0153f97f4912ee3120e166a" FOREIGN KEY ("task") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Alarm" ADD CONSTRAINT "FK_117194ef79e226b16dfdc5f0e27" FOREIGN KEY ("target") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
