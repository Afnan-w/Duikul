import { BadgeCheck } from "lucide-react";
import { Bi } from "@/components/ui/Bi";
import { toBanglaDigits } from "@/lib/utils/date";

type ConfirmationBadgeProps = {
  sourceCount: number;
  confirmed: boolean;
  className?: string;
};

/**
 * "Confirmed" is a source-count claim, not a truth score. The label says so
 * in plain language: independent outlets carried the same event.
 */
export function ConfirmationBadge({
  sourceCount,
  confirmed,
  className = "",
}: ConfirmationBadgeProps) {
  if (confirmed) {
    return (
      <span
        className={`chip border border-accent/20 bg-accent-soft text-accent ${className}`}
      >
        <BadgeCheck size={13} strokeWidth={2} aria-hidden="true" />
        <Bi
          bn={`${toBanglaDigits(sourceCount)} সূত্রে নিশ্চিত`}
          en={`Confirmed by ${sourceCount} sources`}
        />
      </span>
    );
  }

  return (
    <span
      className={`chip border border-rule bg-surface text-muted ${className}`}
    >
      <Bi
        bn={`${toBanglaDigits(sourceCount)} সূত্র`}
        en={`${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`}
      />
    </span>
  );
}
