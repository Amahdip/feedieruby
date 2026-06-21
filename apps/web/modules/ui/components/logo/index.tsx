import { cn } from "@/lib/cn";
import { FeedieRubyMark } from "@/modules/ui/components/feedieruby-brand";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: Readonly<LogoProps>) => (
  <FeedieRubyMark className={cn("h-16 w-auto max-w-[4.5rem]", className)} priority />
);
