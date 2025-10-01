/**
 * XR Utility Functions
 * Efficient WebSpatial SDK utilities for performance optimization
 */

// Check if we're in XR environment
export const isXREnvironment = () => {
  return process.env.XR_ENV === "avp";
};

// Simple XR props for basic enablement (keeping for compatibility)
export const getXRPropsSimple = () => {
  if (isXREnvironment()) {
    return { "enable-xr": true };
  }
  return {};
};

// Get XR props with className - reliable attribute approach
export const getXRProps = (
  className: string = "",
  additionalProps: any = {}
) => {
  if (isXREnvironment()) {
    return {
      "enable-xr": true,
      className: className || "",
      ...additionalProps,
    };
  }
  return {
    className: className || "",
    ...additionalProps,
  };
};

// Get XR props for interactive elements with cursor pointer
export const getXRInteractiveProps = (
  className: string = "",
  additionalProps: any = {}
) => {
  const baseClassName = className
    ? `${className} cursor-pointer`
    : "cursor-pointer";

  if (isXREnvironment()) {
    return {
      "enable-xr": true,
      className: baseClassName,
      ...additionalProps,
    };
  }
  return {
    className: baseClassName,
    ...additionalProps,
  };
};

// Get XR style object for inline styles
export const getXRStyles = (baseStyles: React.CSSProperties = {}) => {
  if (isXREnvironment()) {
    return {
      ...baseStyles,
      enableXr: true,
    } as React.CSSProperties;
  }
  return baseStyles;
};

// Get XR interactive style object with cursor pointer
export const getXRInteractiveStyles = (
  baseStyles: React.CSSProperties = {}
) => {
  if (isXREnvironment()) {
    return {
      ...baseStyles,
      enableXr: true,
      cursor: "pointer",
    } as React.CSSProperties;
  }
  return {
    ...baseStyles,
    cursor: "pointer",
  };
};

// XR-optimized style object for transparent backgrounds
export const getXRBackgroundStyles = (baseStyles: React.CSSProperties = {}) => {
  if (isXREnvironment()) {
    return {
      ...baseStyles,
      enableXr: true,
      "--xr-background-material": "translucent",
    } as React.CSSProperties;
  }
  return baseStyles;
};

// Get the correct base path for assets in XR/AVP mode
export const getAssetPath = (path: string) => {
  if (isXREnvironment()) {
    // In AVP mode, prepend /webspatial/avp to the path
    return `/webspatial/avp${path}`;
  }
  return path;
};
