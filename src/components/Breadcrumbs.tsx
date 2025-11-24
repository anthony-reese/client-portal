"use client";

import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav className="mb-4 text-xs text-gray-400">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx}>
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-gray-200" : ""}>{item.label}</span>
            )}
            {!isLast && <span className="mx-1">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
