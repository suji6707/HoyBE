import { MigrationInterface, QueryRunner } from "typeorm";

export class ImgaeUrlNotNull1693749551026 implements MigrationInterface {
    name = 'ImgaeUrlNotNull1693749551026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "imgUrl" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "imgUrl" DROP NOT NULL`);
    }

}
