import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "pos-toko-buah-super-secret-jwt-key-2026"
);

const COOKIE_NAME = "pos_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, api routes, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let userRole: string | undefined;

  if (token) {
    try {
      // Ekstrak payload untuk mendapatkan properti 'role'
      const { payload } = await jwtVerify(token, SECRET_KEY);
      isAuthenticated = true;
      userRole = payload.role as string; // Pastikan saat createSession, 'role' dimasukkan ke JWT
    } catch {
      isAuthenticated = false;
    }
  }

  // If user is accessing login page while authenticated -> redirect based on role
  if (pathname === "/login") {
    if (isAuthenticated) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/kasir", request.url));
    }
    return NextResponse.next();
  }

  // If user is accessing protected routes without authentication -> redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // --- IMPLEMENTASI ROLE-BASED ACCESS CONTROL (RBAC) ---

  // Daftar rute URL yang HANYA boleh diakses oleh ADMIN
  // Sesuaikan path ini dengan nama folder di dalam direktori "app" Anda
  // Berdasarkan struktur URL Anda sebelumnya (misal: localhost:3000/buah)
  const adminOnlyRoutes = [
    "/dashboard",
    "/user-account",
    "/users", // Rute manajemen user
    "/buah",  // Halaman Data Buah[cite: 1]
    "/supplier",
    "/laporan",
    "/laporan-penjualan",
    "/laporan-laba-rugi"
  ];

  // Cek apakah URL yang dikunjungi saat ini adalah rute khusus Admin
  const isTryingToAccessAdminRoute = adminOnlyRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Blokir jika yang login BUKAN Admin tetapi mencoba masuk ke rute Admin
  if (userRole !== "ADMIN" && isTryingToAccessAdminRoute) {
    return NextResponse.redirect(new URL("/kasir", request.url));
  }

  // Redirect dari root path ("/") ke halaman default masing-masing role
  if (pathname === "/") {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/kasir", request.url));
  }

  // --- AKHIR RBAC ---

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};