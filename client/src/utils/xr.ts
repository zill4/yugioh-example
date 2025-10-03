/**
 * XR Utility Functions
 * Efficient WebSpatial SDK utilities for performance optimization
 */

// Check if we're in XR environment
const checkXREnvironment = () => {
  // 1. Primary: Check if user-agent indicates Apple Vision Pro
  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent;
    console.log("userAgent", userAgent, navigator);
    // Apple Vision Pro user-agent contains "AppleWebKit" and specific identifiers
    // Vision Pro identifies as: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"
    // with additional XR capabilities
    if (
      userAgent.includes("WebSpatial") ||
      userAgent.includes("Apple Vision")
    ) {
      return true;
    }
  }

  // 2. Fallback: Check if we're on the /webspatial/avp route
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/webspatial/avp")) {
      return true;
    }
  }

  // 3. Build-time override: Environment variable
  if (process.env.XR_ENV === "avp") {
    return true;
  }

  return false;
};

// Global isXR flag - computed once when module loads
export const isXR = checkXREnvironment();

// Backwards compatibility
export const isXREnvironment = checkXREnvironment;

// Check if we should use the /webspatial/avp basename
export const shouldUseWebSpatialBasename = () => {
  // Only use the /webspatial/avp basename if the user is actually on that route
  checkXREnvironment();
  return window.location.pathname.startsWith("/webspatial/avp");

  return false;
};

// Get the correct base path for assets in XR/AVP mode
export const getAssetPath = (path: string) => {
  if (isXREnvironment()) {
    // In AVP mode, prepend /webspatial/avp to the path
    return `/webspatial/avp${path}`;
  }
  return path;
};
