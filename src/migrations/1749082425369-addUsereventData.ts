import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsereventData1749082425369 implements MigrationInterface {
  name = 'AddUsereventData1749082425369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_interested_sports_sports" ("userId" integer NOT NULL, "sportsId" integer NOT NULL, CONSTRAINT "PK_16768e6e559f540ef216eb10ed2" PRIMARY KEY ("userId", "sportsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d05d56bc7633fe0db284d0a660" ON "user_interested_sports_sports" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2efa3e31bc2a314b65a5832095" ON "user_interested_sports_sports" ("sportsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "latitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "longitude" double precision`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "searchRadius" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "wantsNearbyNotifications" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607" FOREIGN KEY ("userId") REFERENCES "user"("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_2efa3e31bc2a314b65a58320951" FOREIGN KEY ("sportsId") REFERENCES "sports"("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_2efa3e31bc2a314b65a58320951"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "wantsNearbyNotifications"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "searchRadius"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "latitude"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2efa3e31bc2a314b65a5832095"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d05d56bc7633fe0db284d0a660"`,
    );
    await queryRunner.query(`DROP TABLE "user_interested_sports_sports"`);
  }
}
