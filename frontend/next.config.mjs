/** @type {import('next').NextConfig} */
// Imports
import withPWAInit from "@ducanh2912/next-pwa"; // Import the PWA (Progressive Web App) configuration

// Environment Detection
// Check if the current environment is development mode.
// This is used to conditionally apply settings (like turning off Sentry in development).
const isDevelopment = process.env.NODE_ENV === "development";

// PWA Configuration
// Initialize the PWA (Progressive Web App) configuration using the `withPWAInit` function.
// This function takes an object of PWA-related settings and returns a function to enhance the Next.js config.
const withPWA = withPWAInit({
  dest: "public",              // The output directory for the service worker and related assets
  register: true,              // Automatically registers the service worker
  skipWaiting: true,           // Enables 'skipWaiting' to activate the new service worker immediately after installation
  buildExcludes: [/middleware-manifest.json$/], // Exclude the middleware manifest from the build cache
  scope: "/",                  // The scope of the PWA, typically the root directory
  disable: false,              // PWA is enabled; set to `true` to disable it
  subdomainPrefix: "/",        // Subdomain prefix, useful for multi-domain apps
});

// Base Next.js Configuration
// This is the basic Next.js configuration that applies to both development and production builds.
// It includes configurations like `basePath` and image domains, which are important for routing and handling images.
const nextConfig = {
  basePath: isDevelopment ? "" : "",  // Sets the base path, conditionally different based on the environment (currently left empty)
  images: {
    domains: [
      "cdn.jsdelivr.net",             // Allows images to be loaded from this domain
      "res.cloudinary.com",           // Allows images to be loaded from Cloudinary
      process.env.NEXTAUTH_URL,       // Allows images to be loaded from the NEXTAUTH_URL environment variable
    ],
  },
};

// Export an Async Function for Next.js Config
// The configuration is wrapped in an `async` function to handle dynamic imports based on the environment.
// This function will be executed when Next.js builds the project.

export default async () => {
  // Step 1: Apply the PWA configuration
  let finalConfig = withPWA(nextConfig); // Apply the PWA settings to the base configuration

  // Step 2: Conditionally apply Sentry configuration (for error tracking) if not in development mode
  if (!isDevelopment) {
    // Step 2a: Dynamically import the `withSentryConfig` function if it's not in development mode
    // You commented this line out, but this shows how to dynamically import modules in ES Modules:
    // const { withSentryConfig } = await import("@sentry/nextjs");

    // Step 2b: Apply Sentry settings to the final configuration
    // finalConfig = withSentryConfig(finalConfig, {
    //   org: "pixako-technologies-pvt-ltd", // Your Sentry organization
    //   project: "theryo",                  // Your Sentry project name
    //   silent: !process.env.CI,            // Suppress logging during source map upload unless in CI
    //   widenClientFileUpload: true,        // Upload more comprehensive source maps for better error tracking
    //   reactComponentAnnotation: {
    //     enabled: true,                    // Enable React component annotations for better error breadcrumbs
    //   },
    //   tunnelRoute: "/monitoring",          // Tunnel browser requests through this route to avoid ad-blockers
    //   hideSourceMaps: true,               // Hide source maps from the final client bundle for security
    //   disableLogger: true,                // Disable Sentry logging in production to reduce bundle size
    //   automaticVercelMonitors: true,      // Enable automatic Vercel cron job monitoring
    // });
  }

  // Step 3: Return the final configuration
  return finalConfig;
};
