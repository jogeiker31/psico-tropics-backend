import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { filePath, mimeType } = await this.filesService.getFileById(id);

    if (!filePath) {
      throw new NotFoundException('El archivo no existe.');
    }

    // Construir la ruta absoluta
    const absolutePath = path.resolve(filePath);

    console.log('Absolute file path:', absolutePath); // Depuración

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
    });

    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        throw new NotFoundException('Error al enviar el archivo.');
      }
    });
  }

  @Get('view/:id')
  async viewFile(@Param('id') id: string, @Res() res: Response) {
    const { filePath, mimeType } = await this.filesService.getFileById(id);

    if (!filePath) {
      throw new NotFoundException('El archivo no existe.');
    }

    // Ruta absoluta del archivo
    const absolutePath = path.resolve(filePath);

    console.log('Mostrando archivo:', absolutePath); // Depuración

    res.set({
      'Content-Type': mimeType, // Solo definimos el tipo MIME
    });

    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error al mostrar el archivo:', err);
        throw new NotFoundException('No se pudo mostrar el archivo.');
      }
    });
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.getFileByIdWithRealName(id);

    if (!file.filePath) {
      throw new NotFoundException('El archivo no existe.');
    }

    const absolutePath = path.resolve(file.filePath);

    console.log('Descargando archivo:', absolutePath); // Para depuración

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.realName}"`, // Usamos el realName aquí
    });

    res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        throw new NotFoundException('No se pudo descargar el archivo.');
      }
    });
  }
}
