import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
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
import { CuttingSlipsService } from './departments/cutting-slips.service';
import { CuttingSlipsController } from './departments/cutting-slips.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController, UsersController, ProductsController, OrdersController, CuttingSlipsController],
  providers: [UsersService, AuthService, PrismaService, JwtStrategy, ProductsService, OrdersService, CuttingSlipsService],
})
export class AppModule {}
