/**
 * XR Utility Functions
 * Conditionally adds XR attributes based on environment
 */

// Check if we're in XR environment
export const isXREnvironment = () => {
  return process.env.XR_ENV === "avp";
};

// Get XR props conditionally
export const getXRProps = () => {
  if (isXREnvironment()) {
    return { "enable-xr": true };
  }
  return {};
};

// Get XR props with additional props
export const getXRPropsWithClass = (
  className: string,
  additionalProps: any = {}
) => {
  const xrProps = getXRProps();
  return {
    ...xrProps,
    className,
    ...additionalProps,
  };
};
