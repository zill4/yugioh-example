/**
 * XR Utility Functions
 * Efficient WebSpatial SDK utilities for performance optimization
 */

// Check if we're in XR environment
export const isXREnvironment = () => {
  return process.env.XR_ENV === "avp";
};

// Get the correct base path for assets in XR/AVP mode
export const getAssetPath = (path: string) => {
  if (isXREnvironment()) {
    // In AVP mode, prepend /webspatial/avp to the path
    return `/webspatial/avp${path}`;
  }
  return path;
};
