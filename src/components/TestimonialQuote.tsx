import type { Testimonial } from '@/content/testimonials';

type Props = {
  testimonial: Testimonial;
  className?: string;
};

export default function TestimonialQuote({ testimonial, className = '' }: Props) {
  return (
    <blockquote className={`border-t border-slate-200 pt-8 ${className}`.trim()}>
      <p className="text-slate-800 text-base sm:text-lg leading-relaxed italic mb-5">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <footer className="text-sm text-slate-500 not-italic">
        <span className="text-slate-900 font-medium">{testimonial.name}</span>
        {testimonial.role ? `, ${testimonial.role}` : null}
        {testimonial.company ? ` — ${testimonial.company}` : null}
      </footer>
    </blockquote>
  );
}
