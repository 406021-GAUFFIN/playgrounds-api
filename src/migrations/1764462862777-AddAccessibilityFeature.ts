import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessibilityFeature1764462862777
  implements MigrationInterface
{
  name = 'AddAccessibilityFeature1764462862777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_2efa3e31bc2a314b65a58320951"`,
    );
    await queryRunner.query(
      `CREATE TABLE "accessibilities" ("id" SERIAL NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, CONSTRAINT "UQ_b78542af936d0ee738094bff2a1" UNIQUE ("name"), CONSTRAINT "PK_1039f4d3ecb1c874f003e72143e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "space_accessibilities" ("space_id" integer NOT NULL, "accessibility_id" integer NOT NULL, CONSTRAINT "PK_e18edbc0c7de98b7d10d0c51398" PRIMARY KEY ("space_id", "accessibility_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b773802ad5313753b1aba7f9b" ON "space_accessibilities" ("space_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9e239fa67991dcb0045b0f2e9" ON "space_accessibilities" ("accessibility_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_2efa3e31bc2a314b65a58320951" FOREIGN KEY ("sportsId") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_accessibilities" ADD CONSTRAINT "FK_7b773802ad5313753b1aba7f9b4" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_accessibilities" ADD CONSTRAINT "FK_d9e239fa67991dcb0045b0f2e93" FOREIGN KEY ("accessibility_id") REFERENCES "accessibilities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "space_accessibilities" DROP CONSTRAINT "FK_d9e239fa67991dcb0045b0f2e93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "space_accessibilities" DROP CONSTRAINT "FK_7b773802ad5313753b1aba7f9b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_2efa3e31bc2a314b65a58320951"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" DROP CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9e239fa67991dcb0045b0f2e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7b773802ad5313753b1aba7f9b"`,
    );
    await queryRunner.query(`DROP TABLE "space_accessibilities"`);
    await queryRunner.query(`DROP TABLE "accessibilities"`);
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_2efa3e31bc2a314b65a58320951" FOREIGN KEY ("sportsId") REFERENCES "sports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_interested_sports_sports" ADD CONSTRAINT "FK_d05d56bc7633fe0db284d0a6607" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
