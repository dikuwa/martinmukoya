import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.75rem)] font-black leading-[1.02] text-[color:var(--text-strong)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-[color:var(--text-muted)] md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
