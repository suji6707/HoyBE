import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdmin1693667341680 implements MigrationInterface {
  name = 'AddAdmin1693667341680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "workspace_admin" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "workspaceId" integer, "userId" integer, CONSTRAINT "PK_ff2d638bffa236ebc9e9b867c53" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_e42cf893de420fe6cde2815682c" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_admin" ADD CONSTRAINT "FK_fc4f9c1652638ebd02530d91c9c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_fc4f9c1652638ebd02530d91c9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workspace_admin" DROP CONSTRAINT "FK_e42cf893de420fe6cde2815682c"`,
    );
    await queryRunner.query(`DROP TABLE "workspace_admin"`);
  }
}
