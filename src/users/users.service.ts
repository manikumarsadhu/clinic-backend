import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findMyClinics(superAdminId: string) {
    return this.userRepo.find({
      where: {
        role: UserRole.CLINIC,
        parentId: superAdminId,
      },
    });
  }

  // CLINIC → View only its clients
  async findClientsOfClinic(clinicId: string) {
    return this.userRepo.find({
      where: {
        role: UserRole.CLIENT,
        parentId: clinicId,
      },
    });
  }

  async findMyClients(clinicId: string) {
    return this.userRepo.find({
      where: {
        role: UserRole.CLIENT,
        parentId: clinicId,
      },
    });
  }

  // SUPER_ADMIN → clients under all their clinics
  async findClientsUnderSuperAdmin(superAdminId: string) {
    return this.userRepo
      .createQueryBuilder('client')
      .where('client.role = :clientRole', { clientRole: UserRole.CLIENT })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('clinic.id')
          .from('users', 'clinic')
          .where('clinic.role = :clinicRole')
          .andWhere('clinic.parentId = :superAdminId')
          .getQuery();
        return 'client.parentId IN ' + subQuery;
      })
      .setParameters({
        clinicRole: UserRole.CLINIC,
        superAdminId,
      })
      .getMany();
  }

  async findOne(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
