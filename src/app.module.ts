import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PlanCategoryModule } from './modules/plans/master-plans/plan-categories/plan-category.module';
import { MasterPlanModule } from './modules/plans/master-plans/master-plan.module';
import { MasterServiceModule } from './modules/plans/master-plans/services/master-services/master-service.module';
import { MasterPlanServiceModule } from './modules/plans/master-plans/master-plan-services/master-plan-service.module';
import { ClientPlansModule } from './modules/plans/master-plans/client-plans/client-plans.module';
import { ClientServiceUsageModule } from './modules/plans/master-plans/client-service-usage/client-service-usage.module';
import { AppointmentModule } from './modules/plans/master-plans/appointments/appointment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'clinic_db',
      autoLoadEntities: true,
      synchronize: true, // only for development
      dropSchema: false,
    }),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlanCategoryModule,
    MasterPlanModule,
    MasterServiceModule,
    MasterPlanServiceModule,
    // client plans are a child feature of master-plan section
    ClientPlansModule,
    ClientServiceUsageModule,
    AppointmentModule,
  ],
})
export class AppModule {}
