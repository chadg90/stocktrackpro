export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

/**
 * Optional single featured quote for pricing / elsewhere.
 * Homepage customer cards are driven by `customerStories.ts`.
 * When Chris approves a Newstreet quote, add it there (and optionally enable here).
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
