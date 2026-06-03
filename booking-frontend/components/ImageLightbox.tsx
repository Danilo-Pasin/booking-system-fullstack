"use client";
import { useEffect } from "react";

type ImageLightboxProps = {
  images: { url: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function ImageLightbox({ images, currentIndex, onClose, onNavigate }: ImageLightboxProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft" && currentIndex > 0) { onNavigate(currentIndex - 1); return; }
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) { onNavigate(currentIndex + 1); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (!images.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center transition-opacity duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"
        aria-label="Fechar"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <img
        src={images[currentIndex].url}
        alt=""
        className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white"
          aria-label="Próximo"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <span className="absolute bottom-4 left-4 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </span>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onNavigate(i); }}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
              i === currentIndex ? "ring-2 ring-blue-500 border-blue-500" : "border-transparent hover:border-zinc-500"
            }`}
          >
            <img src={img.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ImageLightbox;
