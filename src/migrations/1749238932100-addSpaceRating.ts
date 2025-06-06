import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpaceRating1749238932100 implements MigrationInterface {
  name = 'AddSpaceRating1749238932100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "space_ratings" ("id" SERIAL NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "rating" integer NOT NULL, "comment" text, "space_id" integer, "user_id" integer, CONSTRAINT "PK_60e741520432cc73c6404ca0c80" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "spaces" ADD "averageRating" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "searchRadius" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_ratings" ADD CONSTRAINT "FK_29f737192824736826193f7d377" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_ratings" ADD CONSTRAINT "FK_6a5c75d5ed0a20103ba3e57f76b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "space_ratings" DROP CONSTRAINT "FK_6a5c75d5ed0a20103ba3e57f76b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_ratings" DROP CONSTRAINT "FK_29f737192824736826193f7d377"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "searchRadius" SET DEFAULT '5000'`,
    );
    await queryRunner.query(`ALTER TABLE "spaces" DROP COLUMN "averageRating"`);
    await queryRunner.query(`DROP TABLE "space_ratings"`);
  }
}
