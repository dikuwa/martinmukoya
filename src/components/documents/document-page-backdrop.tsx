/* eslint-disable @next/next/no-img-element */

const DOCUMENT_BACKDROP = "/assets/backgrounds/PNG/document-backdrop.png";

export function DocumentPageBackdrop() {
  return <img aria-hidden="true" src={DOCUMENT_BACKDROP} alt="" draggable={false} className="pointer-events-none !absolute inset-0 !z-0 h-full w-full select-none object-cover opacity-[0.06]" />;
}
