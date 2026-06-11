import type { Testimonial } from '@/content/testimonials';

type Props = {
  testimonial: Testimonial;
  className?: string;
};

export default function TestimonialQuote({ testimonial, className = '' }: Props) {
  return (
    <blockquote
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 ${className}`.trim()}
    >
      <p className="text-white/85 text-base sm:text-lg leading-relaxed italic mb-5">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <footer className="text-sm text-white/55 not-italic">
        <span className="text-white font-medium">{testimonial.name}</span>
        {testimonial.role ? `, ${testimonial.role}` : null}
        {testimonial.company ? ` — ${testimonial.company}` : null}
      </footer>
    </blockquote>
  );
}
