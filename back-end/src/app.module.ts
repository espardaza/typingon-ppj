import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RecordsModule } from './records/records.module';
import { SnippetsModule } from './snippets/snippets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RecordsModule,
    SnippetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
