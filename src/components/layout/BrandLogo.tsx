import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  linked?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  priority = false,
  linked = true,
}: BrandLogoProps) {
  const logo = (
    <Image
      src={siteConfig.logo.src}
      alt={siteConfig.logo.alt}
      width={siteConfig.logo.width}
      height={siteConfig.logo.height}
      priority={priority}
      className={cn("h-[6rem] w-auto object-contain object-center", imageClassName)}
    />
  );

  if (!linked) {
    return <div className={className}>{logo}</div>;
  }

  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label={siteConfig.name}>
      {logo}
    </Link>
  );
}
