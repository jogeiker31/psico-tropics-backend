import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DatabaseService } from './database.service';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @UseGuards(JwtAuthGuard)
  // 1️⃣ Endpoint para generar y descargar respaldo
  @Get('backup')
  async backupDatabase(@Res() res) {
    try {
      const backupFilePath = await this.databaseService.backupDatabase();
      const filename = path.basename(backupFilePath);

      res.download(backupFilePath, filename, (err) => {
        if (err) {
          console.log(err);
          throw new HttpException(
            'Error al descargar el respaldo',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  // 2️⃣ Endpoint para restaurar base de datos desde un archivo
  @Post('restore')
  @UseInterceptors(FileInterceptor('file'))
  async restoreDatabase(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        'No se ha subido ningún archivo',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const backupPath = path.join(
        __dirname,
        '../../../backups',
        file.originalname,
      );
      fs.writeFileSync(backupPath, file.buffer); // Guardar el archivo temporalmente

      const result = await this.databaseService.restoreDatabase(
        file.originalname,
      );
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
