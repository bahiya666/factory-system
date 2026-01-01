import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { PrismaService } from './shared/prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [UsersService, AuthService, PrismaService, JwtStrategy],
})
export class AppModule {}
