import { useEffect, useRef } from "react";

// Performance monitoring hook for XR components
export const usePerformanceMonitor = (
  componentName: string,
  enabled = true
) => {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = performance.now();
    renderCountRef.current++;
  });

  useEffect(() => {
    if (!enabled) return;

    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    renderTimesRef.current.push(renderTime);

    // Keep only last 10 render times for rolling average
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }

    const averageTime =
      renderTimesRef.current.reduce((acc, time) => acc + time, 0) /
      renderTimesRef.current.length;

    // Log performance metrics every 5 renders
    if (renderCountRef.current % 5 === 0) {
      console.log(`🎯 ${componentName} Performance:`, {
        renders: renderCountRef.current,
        lastRender: `${renderTime.toFixed(2)}ms`,
        avgRender: `${averageTime.toFixed(2)}ms`,
        spatial: process.env.XR_ENV === "avp" ? "✓ XR Mode" : "Desktop Mode",
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    averageRenderTime:
      renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((acc, time) => acc + time, 0) /
          renderTimesRef.current.length
        : 0,
  };
};

// XR-specific performance monitoring
export const useXRPerformanceMonitor = (componentName: string) => {
  const metrics = usePerformanceMonitor(
    componentName,
    process.env.XR_ENV === "avp"
  );

  useEffect(() => {
    if (process.env.XR_ENV === "avp" && metrics.renderCount > 0) {
      // Monitor XR bridge performance
      if ("performance" in window && "mark" in window.performance) {
        window.performance.mark(
          `${componentName}-xr-render-${metrics.renderCount}`
        );
      }
    }
  }, [componentName, metrics.renderCount]);

  return metrics;
};

// Batch update performance tracker
export const useBatchUpdateMonitor = (componentName: string) => {
  const batchCountRef = useRef(0);
  const lastBatchTimeRef = useRef<number>(0);

  const trackBatch = () => {
    batchCountRef.current++;
    const now = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`🔄 ${componentName} Batch ${batchCountRef.current}:`, {
        timeSinceLastBatch:
          lastBatchTimeRef.current > 0
            ? `${(now - lastBatchTimeRef.current).toFixed(2)}ms`
            : "First batch",
        timestamp: now,
      });
    }

    lastBatchTimeRef.current = now;
  };

  return { trackBatch, batchCount: batchCountRef.current };
};
