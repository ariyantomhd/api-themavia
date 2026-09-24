// src/server.ts
import express, { Application } from 'express';
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

// 1. Keamanan Header (Sesuaikan crossOriginResourcePolicy agar tidak memblokir fetch)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Configuration CORS untuk mendukung Multiple Origin & Localhost Development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://themavia.com',
  'https://www.themavia.com',
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Memungkinkan request tanpa origin (seperti Postman, Curl, atau Server-to-Server)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Ubah ke Error jika ingin memblokir domain luar secara ketat
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Pasang CORS Middleware
app.use(cors(corsOptions));

// Menangani Preflight Requests (OPTIONS) secara manual & eksplisit
app.options('*', cors(corsOptions));

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP dalam 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// 3. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Health Check & Root Route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to tmv-hub API Server!' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'TMV Hub API Server Running Healthy' });
});

// 5. Registrasi API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/download', downloadRouter);

// 6. 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Jalankan listener hanya jika berada di environment Local/Development non-Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[SERVER] tmv-hub backend berjalan pada port ${PORT}`);
  });
}

export default app;