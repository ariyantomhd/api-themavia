import { NextRequest } from 'next/server';
import { ApiResponseHelper } from '@/utils/http/response';
import { verifyToken } from '@/middlewares/auth/verifyToken';
import { DownloadService } from '@/services/downloads/download.service';

/**
 * POST: Secure digital asset extraction gateway.
 * Accessible via: POST /api/v1/downloads/request
 * Verifies the user session token, validates target product purchase alignment,
 * and yields a time-restricted, encrypted signed URL to block asset piracy.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Session Guard: Block anonymous requests before processing any database lookup
    const user = await verifyToken(req);
    if (!user) {
      return ApiResponseHelper.unauthorized('Session expired or invalid. Access denied.');
    }

    const body = await req.json();
    const { productId } = body;

    // Sanity check on the requested incoming payload structure
    if (!productId || typeof productId !== 'string') {
      return ApiResponseHelper.badRequest('A valid productId string is strictly required.');
    }

    // 2. Delegate purchase verification and transient signed URL generation to core service layer
    const transientDownloadPayload = await DownloadService.generateSecureDownloadLink(
      user.id,
      productId
    );

    // 3. Return the payload safely to the frontend client bridge
    return ApiResponseHelper.success(
      transientDownloadPayload,
      'Secure short-lived storage token generated successfully.',
      200
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process asset extraction payload.';
    
    // Distinguish between access denial and internal server malfunctions
    if (message.includes('Access denied')) {
      return ApiResponseHelper.forbidden(message);
    }
    
    return ApiResponseHelper.badRequest(message);
  }
}