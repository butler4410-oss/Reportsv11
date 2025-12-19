import React from "react";

type ZipMapPlaceholderProps = {
  /** Optional path to a custom map image (e.g., /maps/zip-map-placeholder.png) */
  src?: string;
  alt?: string;
};

const ZipMapPlaceholder: React.FC<ZipMapPlaceholderProps> = ({
  src = "/maps/zip-map-placeholder.png",
  alt = "Map showing ZIP code areas for this touch point",
}) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="relative w-full h-72 md:h-80">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />

        {/* Optional subtle overlay for label */}
        <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-[11px] text-slate-700 shadow-sm">
          Map preview · ZIP outlines (dummy)
        </div>
      </div>
    </div>
  );
};

export default ZipMapPlaceholder;
