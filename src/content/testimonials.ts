export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

/**
 * Phase 2: when Chris approves a quote, set `enabled: true` and paste the quote text below.
 * Testimonial then appears on the homepage and pricing page automatically.
 */
export const FEATURED_TESTIMONIAL: (Testimonial & { enabled: boolean }) | null = {
  enabled: false,
  quote: '',
  name: 'Chris Ferguson',
  role: 'Director',
  company: 'Newstreet Groundwork Services',
};

export function getFeaturedTestimonial(): Testimonial | null {
  if (!FEATURED_TESTIMONIAL?.enabled || !FEATURED_TESTIMONIAL.quote.trim()) {
    return null;
  }
  const { enabled: _e, ...rest } = FEATURED_TESTIMONIAL;
  return rest;
}
