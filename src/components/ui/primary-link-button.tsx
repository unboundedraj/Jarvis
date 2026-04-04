import Link from "next/link";

type PrimaryLinkButtonProps = {
  href: string;
  label: string;
};

export function PrimaryLinkButton({ href, label }: PrimaryLinkButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand bg-brand px-7 py-2.5 text-sm font-semibold tracking-wide text-brand-contrast shadow-sm transition hover:-translate-y-0.5 hover:bg-[#39c9aa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {label}
    </Link>
  );
}
