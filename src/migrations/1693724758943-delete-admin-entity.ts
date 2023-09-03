import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteAdminEntity1693724758943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE workspace_admin;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE workspace_admin (
            id SERIAL PRIMARY KEY,
            "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
            "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
            "deletedAt" timestamp without time zone,
            "workspaceId" integer REFERENCES "Workspace"(id) ON DELETE CASCADE,
            admin integer REFERENCES "User"(id) ON DELETE CASCADE
        );
        
        -- Indices -------------------------------------------------------
        
        CREATE UNIQUE INDEX "PK_ff2d638bffa236ebc9e9b867c53" ON workspace_admin(id int4_ops);`,
    );
  }
}
