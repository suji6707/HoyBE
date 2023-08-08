import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};

// /Users/heojisu/coding/Sparta/hoy-be/src/auth/auth.service.ts
// /Users/heojisu/coding/Sparta/hoy-be/src/config/db.config.ts
// /Users/heojisu/coding/Sparta/hoy-be/src/users/entity/user.entity.ts
