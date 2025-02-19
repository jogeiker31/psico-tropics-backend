import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class CustomFile {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  realName: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const CustomFileSchema = SchemaFactory.createForClass(CustomFile);
