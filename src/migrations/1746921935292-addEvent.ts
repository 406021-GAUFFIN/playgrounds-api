import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvent1746921935292 implements MigrationInterface {
  name = 'AddEvent1746921935292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."event_status_enum" AS ENUM('available', 'confirmed', 'cancelled', 'finished', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" SERIAL NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying NOT NULL, "dateTime" TIMESTAMP NOT NULL, "status" "public"."event_status_enum" NOT NULL DEFAULT 'available', "minParticipants" integer NOT NULL, "maxParticipants" integer NOT NULL, "creatorId" integer, "spaceId" integer, "sportId" integer, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_participants_user" ("eventId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_f118090c1039333321dbc59eb16" PRIMARY KEY ("eventId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb16f471dfa696d2da841aaf21" ON "event_participants_user" ("eventId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_120333cf695db458809e8b29e2" ON "event_participants_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_7a773352fcf1271324f2e5a3e41" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_005cca0c0f9f86b40248c2cf2fb" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_14126dc54792504366f3db67c28" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_participants_user" ADD CONSTRAINT "FK_cb16f471dfa696d2da841aaf21e" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_participants_user" ADD CONSTRAINT "FK_120333cf695db458809e8b29e22" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_participants_user" DROP CONSTRAINT "FK_120333cf695db458809e8b29e22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_participants_user" DROP CONSTRAINT "FK_cb16f471dfa696d2da841aaf21e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_14126dc54792504366f3db67c28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_005cca0c0f9f86b40248c2cf2fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_7a773352fcf1271324f2e5a3e41"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_120333cf695db458809e8b29e2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb16f471dfa696d2da841aaf21"`,
    );
    await queryRunner.query(`DROP TABLE "event_participants_user"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TYPE "public"."event_status_enum"`);
  }
}
