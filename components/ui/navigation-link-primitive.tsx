import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

export interface NavigationLinkPrimitiveProps {
  href: string;
  label: string;
  icon?: ReactNode;
  active: boolean;
  className?: string;
  iconClassName?: string;
  iconPlacement?: "leading" | "trailing";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function NavigationLinkPrimitive({
  href,
  label,
  icon,
  active,
  className,
  iconClassName,
  iconPlacement = "leading",
  onClick,
}: NavigationLinkPrimitiveProps) {
  const renderedIcon = icon
    ? <span className={iconClassName} aria-hidden="true">{icon}</span>
    : null;

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {iconPlacement === "leading" ? renderedIcon : null}
      <span>{label}</span>
      {iconPlacement === "trailing" ? renderedIcon : null}
    </Link>
  );
}
