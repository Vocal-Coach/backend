import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TrainingModule } from "./training/training.module";
import { TrainingResultModule } from "./training-result/training-result.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "postgres",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "postgres",
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UserModule,
    TrainingModule,
    TrainingResultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
