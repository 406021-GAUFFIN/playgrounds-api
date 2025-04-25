import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const config = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/src/migrations/**/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'mydb',
      entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/src/migrations/**/*{.ts,.js}'],
      migrationsTableName: 'migrations',
    };

export default new DataSource(config as any);
