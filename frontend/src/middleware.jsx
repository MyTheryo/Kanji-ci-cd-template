import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/auth/:path*",
    "/user/ai-generated-summary",
    "/user/create-new-goal",
    "/user/dashboard",
    "/user/home",
    "/user/journaling-feature",
    "/user/report",
    "/user/support-guidance",
    "/profile",
    "/profile/edit-profile",
    "/patient-journey",
    "/provider/dashboard",
    "/provider/home",
    "/provider/notes-listing",
    "/provider/patient-listing",
    "/provider/patient-overview/:path*",
    "/treatment-plan",
    "/admin/all-users",
  ],
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  const url = request.nextUrl.pathname;

  const isTokenExpired = (token) => {
    if (!token || typeof token !== "string") return true;
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return exp < Date.now() / 1000; // Check if expired
  };

  if (isTokenExpired(token?.user?.accessToken) && !url.startsWith("/auth")) {
    // Clear cookies and redirect to login
    const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL);
    response.cookies.set("next-auth.session-token", "", { maxAge: -1 });
    response.cookies.set("next-auth.csrf-token", "", { maxAge: -1 });
    return response;
  }

  // Redirect to home page if no token and trying to access protected routes
  if (!token && !url.startsWith("/auth")) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Role-based home routes
  const roleHomeRoutes = {
    Admin: `${process.env.NEXT_PUBLIC_BASE_URL}admin/all-users`,
    Provider: `${process.env.NEXT_PUBLIC_BASE_URL}provider/home`,
    Patient: `${process.env.NEXT_PUBLIC_BASE_URL}user/home`,
  };

  if (
    token &&
    token?.user?.userRole === "Patient" &&
    !url.startsWith("/patient-journey")
  ) {
    if (token?.user?.initialJourneyCount < 12) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}patient-journey`
      );
    }
  }

  // Redirect logged-in users away from auth routes
  if (
    token &&
    url.startsWith("/auth") &&
    !url.startsWith("/auth/verification")
  ) {
    const homeRoute = roleHomeRoutes[token.user.userRole];
    if (homeRoute) {
      return NextResponse.redirect(homeRoute);
    }
  }

  // Define role-based routes
  const roleRoutes = {
    Provider: [
      "/provider/dashboard",
      "/provider/home",
      "/provider/notes-listing",
      "/provider/patient-listing",
      "/provider/patient-overview",
    ],
    Patient: [
      "/user/ai-generated-summary",
      "/user/create-new-goal",
      "/user/dashboard",
      "/user/home",
      "/user/journaling-feature",
      "/user/report",
      "/user/support-guidance",
    ],
    Admin: ["/admin/all-users"],
  };

  // Check if the user is trying to access a restricted route
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (
      routes.some((route) => url.startsWith(route)) &&
      token?.user?.userRole !== role
    ) {
      const homeRoute = roleHomeRoutes[token.user.userRole];
      if (homeRoute) {
        return NextResponse.redirect(homeRoute);
      }
    }
  }

  return NextResponse.next();
}
