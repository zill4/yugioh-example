import React, { useEffect } from "react";

interface TooltipProps {
  message: string;
  show: boolean;
  onHide: () => void;
  duration?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  message,
  show,
  onHide,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  if (!show) return null;

  return (
    <div
      enable-xr
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="bg-slate-800/95 border-2 border-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in"
        enable-xr
      >
        <div className="flex items-center gap-3">
          {/* <div className="text-2xl">⚠️</div> */}
          <div className="text-sm font-bold">{message}</div>
        </div>
      </div>
    </div>
  );
};
