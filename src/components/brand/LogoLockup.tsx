import { SITE_NAME, SITE_NAME_BN } from "@/config/site";
import { LogoMark } from "./LogoMark";
import { Wordmark } from "./Wordmark";

type LogoLockupProps = {
  variant?: "latin" | "bangla";
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  title?: string;
};

/**
 * Badge + wordmark lockup. Use `variant="bangla"` for the Bangla nameplate.
 */
export function LogoLockup({
  variant = "latin",
  className = "",
  markClassName = "h-8 w-8 text-accent",
  wordmarkClassName = "h-6 w-auto text-ink",
  title,
}: LogoLockupProps) {
  const label = variant === "bangla" ? SITE_NAME_BN : SITE_NAME;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} title={title ?? label} />
      <Wordmark
        variant={variant}
        className={wordmarkClassName}
        label={label}
      />
    </span>
  );
}
