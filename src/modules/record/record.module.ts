import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Record, RecordSchema } from './schemas/record.schema';

@Module({
  controllers: [RecordController],
  providers: [RecordService],
  imports: [
    MongooseModule.forFeature([
      { name: Record.name, schema: RecordSchema },
    ]),
  ],
  exports:[RecordService]
})
export class RecordModule {}
