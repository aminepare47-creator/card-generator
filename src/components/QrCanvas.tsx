"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling, {
  type DotType,
  type CornerSquareType,
  type CornerDotType,
  type ErrorCorrectionLevel,
} from "qr-code-styling";

export interface QrStyleOptions {
  data: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  dotsType?: DotType;
  cornersSquareType?: CornerSquareType;
  cornersDotType?: CornerDotType;
  logoUrl?: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  margin?: number;
  hideIfDataEmpty?: boolean;
}

export const DEFAULT_QR_OPTIONS: Required<
  Omit<QrStyleOptions, "data" | "logoUrl">
> = {
  size: 320,
  fgColor: "#0f172a",
  bgColor: "#ffffff",
  dotsType: "rounded",
  cornersSquareType: "extra-rounded",
  cornersDotType: "dot",
  errorCorrectionLevel: "Q",
  margin: 8,
  hideIfDataEmpty: false,
};

let cachedInstance: QRCodeStyling | null = null;
let cachedKey = "";

function buildOptions(options: QrStyleOptions) {
  const logoSizePct = options.logoUrl ? 0.22 : 0;
  return {
    width: options.size ?? DEFAULT_QR_OPTIONS.size,
    height: options.size ?? DEFAULT_QR_OPTIONS.size,
    type: "canvas" as const,
    data: options.data || " ",
    image: options.logoUrl || undefined,
    margin: options.margin ?? DEFAULT_QR_OPTIONS.margin,
    qrOptions: {
      errorCorrectionLevel:
        options.errorCorrectionLevel ?? DEFAULT_QR_OPTIONS.errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: logoSizePct,
      margin: 4,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      color: options.fgColor ?? DEFAULT_QR_OPTIONS.fgColor,
      type: options.dotsType ?? DEFAULT_QR_OPTIONS.dotsType,
    },
    backgroundOptions: {
      color: options.bgColor ?? DEFAULT_QR_OPTIONS.bgColor,
    },
    cornersSquareOptions: {
      color: options.fgColor ?? DEFAULT_QR_OPTIONS.fgColor,
      type: options.cornersSquareType ?? DEFAULT_QR_OPTIONS.cornersSquareType,
    },
    cornersDotOptions: {
      color: options.fgColor ?? DEFAULT_QR_OPTIONS.fgColor,
      type: options.cornersDotType ?? DEFAULT_QR_OPTIONS.cornersDotType,
    },
  };
}

function getInstance(options: QrStyleOptions) {
  const settings = buildOptions(options);
  // The library supports updating in place — reuse instance to avoid flicker
  // and keep DOM nodes stable.
  const key = JSON.stringify(settings);
  if (cachedInstance && cachedKey === key) {
    return cachedInstance;
  }
  cachedInstance = new QRCodeStyling(settings);
  cachedKey = key;
  return cachedInstance;
}

export function QrCanvas({ options, className = "" }: { options: QrStyleOptions; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const instance = getInstance(options);
    instance.append(ref.current);
    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [options]);

  if (options.hideIfDataEmpty && !options.data) {
    return (
      <div
        className={`grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 ${className}`}
        style={{ minHeight: options.size ?? 240 }}
      >
        Renseigne un champ pour voir l'aperçu.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`cp-qr mx-auto inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-inner ring-1 ring-black/5 ${className}`}
    />
  );
}

export async function downloadQr(options: QrStyleOptions, format: "png" | "svg") {
  const instance = getInstance(options);
  if (format === "png") {
    await instance.download({ extension: "png", name: "qrcode" });
  } else {
    await instance.download({ extension: "svg", name: "qrcode" });
  }
}
