import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteAdminEntity1693724387058 implements MigrationInterface {
  name = 'DeleteAdminEntity1693724387058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspace_member" ADD "admin" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspace_member" DROP COLUMN "admin"`,
    );
  }
}
