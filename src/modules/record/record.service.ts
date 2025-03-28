import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Record } from './schemas/record.schema';
import { Model } from 'mongoose';

@Injectable()
export class RecordService {
  constructor(@InjectModel(Record.name) private recordMOdel: Model<Record>) {}

  create(data) {
    const newItem = new this.recordMOdel(data);
    return newItem.save();
  }

  getAll(startDate: string, endDate: string) {

    const _endDate = new Date(endDate);
    _endDate.setHours(23, 59);
    return this.recordMOdel
      .find({
        createdAt: {
          $gte: new Date(startDate), // Fecha de inicio (mayor o igual)
          $lte: new Date(_endDate), // Fecha de fin (menor o igual)
        },
      })

      .populate('user')
      .sort({ createdAt: -1 });
  }
}
