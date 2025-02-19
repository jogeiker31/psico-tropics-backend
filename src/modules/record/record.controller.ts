import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { RecordService } from './record.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import * as Pdf from 'pdfkit-table';
import { Response } from 'express';
import 'pdfkit-table';

@Controller('record')
export class RecordController {
  constructor(private recordService: RecordService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Query('start') start: string, @Query('end') end: string) {
    return this.recordService.getAll(start, end);
  }

  @Get('generate-pdf')
  async generatePdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    // Filtrar los registros por fecha usando el servicio
    const records = await this.recordService.getAll(startDate, endDate);

    // Crear el documento PDF
    const doc = new Pdf.default({ margin: 50 });

    // Configurar la respuesta para enviar el PDF al cliente
    const start = this.formatDate(new Date(startDate));
    const end = this.formatDate(new Date(endDate));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bitacora_${start}_to_${end}.pdf"`, // Usamos el realName aquí
    });
    doc.pipe(res); // Conectar el flujo de PDF a la respuesta HTTP

    const logoWidth = 100;
    const centerX = (doc.page.width - logoWidth) / 2;
    doc
      .image('./logoapp.png', centerX, 50, { width: 100 }) // Imagen con posición definida
      .moveDown(6); // Espacio después de la imagen

    // Título centrado
    doc
      .fontSize(20)
      .text('Desarrollando Bienestar', { align: 'center' })
      .moveDown(1); // Espacio después del título

    // Título del documento
    doc
      .fontSize(16)
      .text(`Bitácora desde el día ${start} al día ${end}`, {
        align: 'center',
      })
      .moveDown();

    // Configurar la tabla
    const table = {
      headers: ['Usuario', 'Acción', 'Fecha'], // Encabezados
      rows: records.map((record: any) => [
        record.user.name, // Nombre del usuario
        record.action, // Acción
        new Date(record.createdAt).toLocaleString(), // Fecha con formato legible
      ]),
    };

    // Agregar la tabla al documento PDF
    doc.moveDown();
    doc.table(table, {
      prepareHeader: () => doc.fontSize(12).font('Helvetica-Bold'),
      prepareRow: (row, i) => doc.fontSize(10).font('Helvetica'),
      columnSpacing: 10,
      padding: [5],
    });

    // Finalizar el documento
    doc.end();
  }
  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0'); // Obtener el día con 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtener el mes (getMonth() empieza desde 0)
    const year = date.getFullYear(); // Obtener el año

    return `${day}/${month}/${year}`; // Formato: dd/mm/yyyy
  }
}
