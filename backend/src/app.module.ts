import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { PrismaService } from './shared/prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController, UsersController, ProductsController, OrdersController],
  providers: [UsersService, AuthService, PrismaService, JwtStrategy, ProductsService, OrdersService],
})
export class AppModule {}
