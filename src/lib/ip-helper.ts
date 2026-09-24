// src/lib/ip-helper.ts
import axios from 'axios';
import { Request } from 'express';

export async function getClientLocation(req: Request) {
  try {
    // Ambil IP dari header proxy atau socket
    const forwarded = req.headers['x-forwarded-for'];
    let ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress || '127.0.0.1';
    
    // Jika localhost / IP lokal
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      ip = ''; // Biarkan ipinfo melacak IP publik server/klien saat ini jika online
    }

    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    const data = response.data;

    return {
      ip: data.ip || 'Unknown IP',
      city: data.city || 'Unknown City',
      region: data.region || 'Unknown Region',
      country: data.country || 'Unknown Country',
      device: req.headers['user-agent'] || 'Unknown Device',
    };
  } catch (error) {
    return {
      ip: '127.0.0.1',
      city: 'Local',
      region: 'Local',
      country: 'ID',
      device: req.headers['user-agent'] || 'Unknown Device',
    };
  }
}