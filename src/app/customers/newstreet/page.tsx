import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export const metadata: Metadata = {
  title: 'Newstreet Groundworks Case Study',
  description:
    'How Newstreet Groundworks, County Durham, uses Stock Track PRO for fleet inspections, defect close-out, and compliance across active sites.',
  alternates: { canonical: '/customers/newstreet' },
};

export default function NewstreetCaseStudyPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-3xl">
        <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
          Customer story
        </p>
        <div className="relative h-14 w-52 mb-8">
          <Image
            src="/clients/newstreet-groundwork.png"
            alt="Newstreet Groundwork Services"
            fill
            className="object-contain object-left"
            sizes="208px"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          Newstreet Groundworks
        </h1>
        <p className="text-white/75 text-lg leading-relaxed mb-8">
          County Durham groundworks contractor managing vehicles across multiple active sites.
        </p>

        <div className="space-y-6 text-white/75 leading-relaxed">
          <p>
            Newstreet Groundworks replaced WhatsApp groups and paper inspection sheets with Stock Track PRO so drivers,
            fitters, and managers work from the same live records.
          </p>
          <p>
            Drivers complete daily vehicle inspections in the app. When a defect is raised, managers and fitters see it
            on My Jobs and can close work out with a clear audit trail — instead of chasing messages or lost paperwork.
          </p>
          <p className="text-white/55 text-sm italic border-l-2 border-white/20 pl-4">
            A fuller case study with more detail from the Newstreet team is being prepared. If you run a similar
            operation and want to see how Stock Track PRO fits your fleet, start a free trial or get in touch.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
          >
            Start 7-Day Free Trial
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border border-white/20 hover:bg-white/5"
          >
            Contact us
          </Link>
        </div>
      </main>
    </div>
  );
}
