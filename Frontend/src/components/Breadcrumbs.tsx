import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://aryora-website-d3sv.vercel.app",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href
          ? `https://aryora-website-d3sv.vercel.app${item.href}`
          : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-xs text-ink-subtle">
          <li>
            <Link
              href="/"
              className="hover:text-ink transition-colors"
            >
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight size={12} strokeWidth={1.5} className="opacity-40" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-ink transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-ink font-medium"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
