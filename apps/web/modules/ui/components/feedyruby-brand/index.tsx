import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { APP_NAME, APP_NAME_LATIN } from "@/lib/brand-color";
import { cn } from "@/lib/cn";

interface BrandImageProps {
  className?: string;
  priority?: boolean;
  isRtl?: boolean;
  isDark?: boolean;
}

export const FeedyRubyIcon = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.icon}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("size-8", className)}
  />
);

export const FeedyRubyIconLight = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.iconSimple}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("size-8", className)}
  />
);

export const FeedyRubyMark = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.icon}
    alt={APP_NAME}
    width={80}
    height={80}
    priority={priority}
    className={cn("h-auto w-full max-w-[5rem]", className)}
  />
);

/**
 * Wordmark rendered as HTML gradient text + the vector gem icon.
 *
 * We deliberately do NOT use the `<text>`-based wordmark SVGs here: SVGs loaded
 * via <img>/next/image can't access the page's web fonts, so the Farsi script
 * (Vazirmatn) loses its shaping and renders broken. Rendering the brand name as
 * real HTML text inherits the page font (Iran Sans X), which shapes Farsi
 * correctly, and the FeedyRuby gem-spectrum gradient is applied via
 * background-clip.
 */
export const FeedyRubyWordmark = ({
  className,
  priority = false,
  isRtl = false,
}: Readonly<BrandImageProps>) => {
  const text = isRtl ? APP_NAME : APP_NAME_LATIN;

  return (
    <span dir={isRtl ? "rtl" : "ltr"} className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "bg-gradient-to-r from-[#FBBF24] via-[#EC4899] to-[#7C3AED] bg-clip-text",
          "text-2xl font-bold leading-none tracking-tight text-transparent"
        )}>
        {text}
      </span>
      <FeedyRubyMark className="size-7" priority={priority} />
    </span>
  );
};
