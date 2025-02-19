import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomFile } from './schemas/files.schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadPath = './files';

  constructor(
    @InjectModel(CustomFile.name) private customFileModel: Model<CustomFile>,
  ) {
    // Crear el directorio si no existe
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<CustomFile> {
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Guardar el archivo en la ruta especificada
    fs.writeFileSync(filePath, file.buffer);

    // Guardar información del archivo en la base de datos
    const createdFile = new this.customFileModel({
      name: fileName,
      realName: file.originalname,
      type: file.mimetype,
    });
    return createdFile.save();
  }

  async getFileById(
    fileId: string,
  ): Promise<{ filePath: string; mimeType: string }> {
    const file = await this.customFileModel.findById(fileId);
    if (!file || file.deleted) {
      throw new NotFoundException('Archivo no encontrado o eliminado.');
    }

    const filePath = path.join(this.uploadPath, file.name);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo no existe en el servidor.');
    }

    return { filePath, mimeType: file.type };
  }

  async getFileByIdWithRealName(
    id: string,
  ): Promise<{ filePath: string; mimeType: string; realName: string }> {
    const file = await this.customFileModel.findById(id);

    if (!file || file.deleted) {
      throw new NotFoundException('Archivo no encontrado.');
    }

    const filePath = path.resolve(`./files/${file.name}`);
    const mimeType = this.getMimeType(file.type);

    return { filePath, mimeType, realName: file.realName };
  }

  private getMimeType(fileType: string): string {
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      // Agrega más tipos MIME según sea necesario
    };
    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }
}
