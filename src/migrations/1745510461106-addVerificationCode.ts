import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationCode1745510461106 implements MigrationInterface {
  name = 'AddVerificationCode1745510461106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "verificationCode" character varying(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "verificationCode"`,
    );
  }
}
