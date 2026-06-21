import { FeedieRubyMark } from "@/modules/ui/components/feedieruby-brand";

interface SalamRubyLogoProps {
  className?: string;
}

/** @deprecated Use FeedieRubyMark — kept for existing imports */
export const SalamRubyLogo = ({ className }: Readonly<SalamRubyLogoProps>) => (
  <FeedieRubyMark className={className} />
);
