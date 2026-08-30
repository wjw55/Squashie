import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function EditorialCallout() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[1.6rem] bg-[#143d2f] text-white shadow-[0_25px_70px_rgba(18,61,45,0.16)]">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <Badge className="mb-5 bg-white/10 text-white">
              Built for the handover after university
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your squash community should not disappear after graduation.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
              Squashie makes the informal knowledge around access, fees,
              training, and club culture visible—so your next game can happen
              closer to home.
            </p>
            <Link
              href="/methodology"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f2bc5b] hover:text-[#ffd17e]"
            >
              See how we check listings <ArrowRight className="size-4" />
            </Link>
          </div>
          <Image
            src="/og.png"
            alt="Two young adult squash players sharing a relaxed moment after a game"
            width={1734}
            height={908}
            className="h-full min-h-64 w-full object-cover object-center lg:min-h-96"
          />
        </div>
      </div>
    </section>
  );
}
