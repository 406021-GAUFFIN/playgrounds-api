import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialUser1745432592533 implements MigrationInterface {
  name = 'AddInitialUser1745432592533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //pass: adminPlaygrounds
    await queryRunner.query(
      `INSERT INTO "user" (name, email, password, "emailValidatedAt", role) VALUES ('ADMIN', 'admin@playgrounds.com', '$2b$10$BwDZSwYqdLBYiLk7HvVX3u6Hr2l8ieUM8zq4PA/XTrd2bqVNjpgpm', NOW(), 'ADMIN' )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user"`);
  }
}
