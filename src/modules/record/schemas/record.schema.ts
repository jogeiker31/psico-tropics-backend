import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Record {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario' })
  user: ObjectId;

  @Prop({ required: true })
  action: string;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
