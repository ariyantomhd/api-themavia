// src/server.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import Route Handlers
import authRouter from './modules/auth/auth.route';
import productRouter from './modules/products/product.route';
import cartRouter from './modules/cart/cart.route';
import { checkoutRoutes } from './modules/checkout/checkout.route';
import { paymentRoutes } from './modules/payments/payment.route';
import dashboardRoutes from './modules/dashboard/dashboard.route';
import { licenseRoutes } from './modules/licenses/license.route';
import downloadRouter from './modules/download/download.route';

// Import Middlewares
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Diperlukan agar Express membaca IP asli client jika berada di belakang Vercel/Cloudflare/Reverse Proxy
app.set('trust proxy', 1);

// 1. Keamanan Header (Helmet Konfigurasi Cross-Origin)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  })
);

// 2. Konfigurasi CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://themavia.com',
  'https://www.themavia.com',
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti Postman, Curl, atau Mobile App)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Pasang CORS untuk seluruh route (termasuk penanganan otomatis Preflight OPTIONS)
app.use(cors(corsOptions));

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting (Dipasang setelah parsing dan CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP per jendela waktu
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan rate-limiter hanya ke endpoint API utama
app.use('/api', limiter);

// 5. Health Check & Root Route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to tmv-hub API Server!' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'TMV Hub API Server Running Healthy' });
});

// 6. Registrasi API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/download', downloadRouter);

// 7. 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Listener untuk lingkungan lokal
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[SERVER] tmv-hub backend berjalan pada port ${PORT}`);
  });
}

export default app;