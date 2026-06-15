export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  // Gunakan daftar domain yang diizinkan untuk fleksibilitas
  const allowedOrigins = ['https://www.themavia.com', 'http://localhost:5173'];
  const responseOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];

<<<<<<< HEAD
  // Daftar header yang diizinkan (TAMBAHKAN x-api-secret DI SINI)
  const allowedHeaders = 'Content-Type, Authorization, x-api-secret';

  // 2. Jika ini adalah Preflight (OPTIONS), berikan respon langsung
=======
>>>>>>> dac8d868c21d75ddb05ea04849d44bb7d8947a2a
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': allowedHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', responseOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders);

  return response;
}
