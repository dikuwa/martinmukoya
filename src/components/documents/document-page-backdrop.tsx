import Image from "next/image";

const DOCUMENT_BACKDROP = "/assets/backgrounds/SVG/map-01.svg";

export function DocumentPageBackdrop() {
  return (
    <Image
      src={DOCUMENT_BACKDROP}
      alt=""
      fill
      sizes="100vw"
      aria-hidden="true"
      draggable={false}
      className="pointer-events-none !z-0 select-none object-contain opacity-[0.09] flex items-center justify-center"
    />
  );
}
