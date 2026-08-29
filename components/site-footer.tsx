import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-[#143d2f] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5 font-semibold">
            <span
              className="grid size-8 place-items-center rounded-lg bg-white/10"
              aria-hidden="true"
            >
              <span className="size-2 rounded-full bg-[#f2bc5b]" />
            </span>
            Squashie
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            A clearer way to discover squash communities in Singapore. Always
            confirm current details with the organizer before paying or
            travelling.
          </p>
        </div>
        <div className="flex gap-5 text-sm text-white/75 sm:items-end">
          <Link href="/methodology" className="hover:text-white">
            Methodology
          </Link>
          <a
            href="https://sgsquash.com/find-a-court/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Find a court
          </a>
        </div>
      </div>
    </footer>
  );
}
