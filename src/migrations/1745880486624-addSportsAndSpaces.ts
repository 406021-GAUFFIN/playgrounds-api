import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSportsAndSpaces1745880486624 implements MigrationInterface {
  name = 'AddSportsAndSpaces1745880486624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sports" ("id" SERIAL NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "pictogram" text NOT NULL, "minParticipants" integer, "maxParticipants" integer, CONSTRAINT "PK_4fa1063d368e1fd68ea63c7d860" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spaces" ("id" SERIAL NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "address" character varying(200) NOT NULL, "schedule" text, "conditions" text NOT NULL, "isAccessible" boolean NOT NULL DEFAULT false, "description" text, "isActive" boolean NOT NULL DEFAULT true, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, CONSTRAINT "PK_dbe542974aca57afcb60709d4c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "space_sports" ("space_id" integer NOT NULL, "sport_id" integer NOT NULL, CONSTRAINT "PK_bd869553549d73696a4f851f726" PRIMARY KEY ("space_id", "sport_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e825c2ffc56233a15b659db80e" ON "space_sports" ("space_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d882780553ace952748de8555" ON "space_sports" ("sport_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "space_sports" ADD CONSTRAINT "FK_e825c2ffc56233a15b659db80e6" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_sports" ADD CONSTRAINT "FK_2d882780553ace952748de8555a" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "space_sports" DROP CONSTRAINT "FK_2d882780553ace952748de8555a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_sports" DROP CONSTRAINT "FK_e825c2ffc56233a15b659db80e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d882780553ace952748de8555"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e825c2ffc56233a15b659db80e"`,
    );
    await queryRunner.query(`DROP TABLE "space_sports"`);
    await queryRunner.query(`DROP TABLE "spaces"`);
    await queryRunner.query(`DROP TABLE "sports"`);
  }
}
