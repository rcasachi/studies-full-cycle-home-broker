import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset } from '@prisma/client';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { Asset as AssetModel } from './assets.schema';

@Injectable()
export class AssetsService {
  constructor(
    private prismaService: PrismaService,
    @InjectModel(AssetModel.name) private assetModel: Model<AssetModel>,
  ) {}

  all() {
    return this.prismaService.asset.findMany();
  }

  findOne(id: string) {
    return this.prismaService.asset.findUnique({ where: { id } });
  }

  create(data: { id: string; symbol: string; price: number }) {
    return this.prismaService.asset.create({ data });
  }

  subscribeEvents(): Observable<{ event: 'asset-price-changed'; data: Asset }> {
    return new Observable((observer) => {
      this.assetModel
        .watch(
          [
            {
              $match: {
                operationType: 'update',
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          console.log(data);
          const asset = await this.prismaService.asset.findUnique({
            where: { id: String(data.fullDocument._id) },
          });
          observer.next({ event: 'asset-price-changed', data: asset });
        });
    });
  }
}
