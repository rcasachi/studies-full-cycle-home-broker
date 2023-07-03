import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './assets.schema';
import { AssetDaily, AssetDailySchema } from './assets-daily.schema';
import { AssetsDailyService } from './assets-daily.service';
import { AssetsDailyController } from './assets-daily.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: AssetDaily.name, schema: AssetDailySchema },
    ]),
  ],
  controllers: [AssetsController, AssetsDailyController],
  providers: [AssetsService, AssetsDailyService],
  exports: [AssetsService, AssetsDailyService],
})
export class AssetsModule {}
