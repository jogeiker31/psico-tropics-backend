import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomFile, CustomFileSchema } from './schemas/files.schemas';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: CustomFile.name, schema: CustomFileSchema },
        ]),
      ],
      providers: [FilesService],
      controllers: [FilesController],
})
export class FilesModule {}
