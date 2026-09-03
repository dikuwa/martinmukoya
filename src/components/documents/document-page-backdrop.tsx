import Image from "next/image";

const DOCUMENT_BACKDROP = "/assets/backgrounds/SVG/map-01.svg";

type BackdropPosition = "top" | "bottom";

export function DocumentPageBackdrop({ position = "top" }: { position?: BackdropPosition }) {
  return (
    <Image
      src={DOCUMENT_BACKDROP}
      alt=""
      fill
      sizes="100vw"
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none !z-0 select-none object-contain opacity-[0.09] ${position === "bottom" ? "object-bottom" : "object-top"}`}
    />
  );
}
