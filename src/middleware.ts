export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  // Gunakan daftar domain yang diizinkan untuk fleksibilitas
  const allowedOrigins = ['https://www.themavia.com', 'http://localhost:5173'];
  const responseOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', responseOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
