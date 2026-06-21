"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export default function ProductImage({
  src,
  alt,
  className = "",
  priority = false,
  fill = true,
  sizes,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-cream to-gold-light/30 ${className}`}
      >
        <div className="text-center p-4">
          <div className="w-16 h-24 mx-auto border-2 border-gold/40 rounded-sm mb-2" />
          <p className="text-xs text-muted uppercase tracking-widest">Lumière</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
    />
  );
}
