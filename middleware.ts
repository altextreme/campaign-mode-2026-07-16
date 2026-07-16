import { NextRequest, NextResponse } from "next/server";

const REALM = "Campaign Mode";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export function middleware(request: NextRequest) {
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return unauthorized();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const decoded = atob(base64Credentials);
    const [incomingUser, ...rest] = decoded.split(":");
    const incomingPassword = rest.join(":");

    if (incomingUser === username && incomingPassword === password) {
      return NextResponse.next();
    }
  } catch {
    // Fall through to unauthorized.
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
