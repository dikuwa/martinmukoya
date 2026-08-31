import Image from "next/image";

const DOCUMENT_BACKDROP = "/assets/backgrounds/PNG/document-backdrop.png";

export function DocumentPageBackdrop() {
  return (
    <Image
      src={DOCUMENT_BACKDROP}
      alt=""
      fill
      sizes="100vw"
      aria-hidden="true"
      draggable={false}
      className="pointer-events-none !z-0 select-none object-cover opacity-[0.06]"
    />
  );
}
