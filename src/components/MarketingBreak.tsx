type Props = {
  /** soft = thin centered rule; default = block colour bar; band = stronger major break */
  variant?: 'soft' | 'default' | 'band';
};

/** Full-width colour bar used between marketing sections. */
export default function MarketingBreak({ variant = 'default' }: Props) {
  const className =
    variant === 'soft'
      ? 'mkt-section-break-soft'
      : variant === 'band'
        ? 'mkt-section-band'
        : 'mkt-section-break';

  return <div className={className} aria-hidden="true" />;
}
