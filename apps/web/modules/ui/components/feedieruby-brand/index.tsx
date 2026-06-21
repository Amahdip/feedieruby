import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { APP_NAME, APP_NAME_LATIN } from "@/lib/brand-color";
import { cn } from "@/lib/cn";

interface BrandImageProps {
  className?: string;
  priority?: boolean;
}

export const FeedieRubyIcon = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.iconRubyTile}
    alt={APP_NAME}
    width={200}
    height={200}
    priority={priority}
    className={cn("size-8 rounded-lg", className)}
  />
);

export const FeedieRubyIconLight = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.iconWhiteTile}
    alt={APP_NAME}
    width={200}
    height={200}
    priority={priority}
    className={cn("size-8 rounded-lg", className)}
  />
);

export const FeedieRubyMark = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.mark}
    alt={APP_NAME}
    width={200}
    height={226}
    priority={priority}
    className={cn("h-auto w-full max-w-[5rem]", className)}
  />
);

export const FeedieRubyWordmark = ({ className, priority = false }: Readonly<BrandImageProps>) => (
  <Image
    src={BRAND_ASSETS.wordmark}
    alt={APP_NAME_LATIN}
    width={560}
    height={200}
    priority={priority}
    className={cn("h-8 w-auto max-w-[10rem]", className)}
  />
);
