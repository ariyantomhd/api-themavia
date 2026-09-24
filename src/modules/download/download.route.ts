// src/modules/download/download.route.ts
import { Router } from 'express';
import { DownloadController } from './download.controller';

const router = Router();
const downloadController = new DownloadController();

// POST /api/download
router.post('/', downloadController.handleDownload);

export default router;