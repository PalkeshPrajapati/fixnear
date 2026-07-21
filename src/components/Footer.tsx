import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/**
 * Site-wide Footer.
 * - Brand name on the left
 * - Placeholder navigation links
 */
export function Footer() {
  return (
    <footer
      id="site-footer"
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: "1px solid var(--border-light)",
        marginTop: "auto",
      }}
    >
      <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          id="footer-brand"
          className="flex items-center gap-1.5 no-underline"
          aria-label="FixNear home"
        >
          <span
            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs select-none"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            F
          </span>
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Fix<span style={{ color: "var(--brand-primary)" }}>Near</span>
          </span>
        </Link>

        {/* Links */}
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-xs no-underline transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} FixNear
        </p>
      </div>
    </footer>
  );
}
