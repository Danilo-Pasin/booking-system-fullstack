"use client";
import { useState } from "react";

type Props = {
  src?: string;
  name: string;
  className?: string;
  textClassName?: string;
};

export default function AvatarWithFallback({ src, name, className = "w-10 h-10", textClassName = "text-sm" }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`${className} rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center font-bold shrink-0`}>
      {src && !imgError ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onLoad={() => setImgError(false)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={`text-zinc-400 ${textClassName}`}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
