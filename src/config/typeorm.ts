import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: ['dist/**/*.entity.{js,ts}'],
  migrations: ['dist/migrations/*.{js,ts}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default new DataSource(TypeOrmConfig as DataSourceOptions);
