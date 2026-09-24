// src/modules/download/download.controller.ts
import { Request, Response } from 'express';
import { DownloadService } from './download.service';
import { DownloadRequestDTO } from '../../types/download';

export class DownloadController {
  private downloadService: DownloadService;

  constructor() {
    this.downloadService = new DownloadService();
  }

  public handleDownload = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: DownloadRequestDTO = req.body;

      if (!dto.license_key) {
        res.status(400).json({ error: 'License key is required.' });
        return;
      }

      const clientIp = req.ip || req.socket.remoteAddress;
      const result = await this.downloadService.processDownload(dto, clientIp);

      res.status(200).json({
        success: true,
        message: 'Download link generated successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Internal server error during download process.',
      });
    }
  };
}