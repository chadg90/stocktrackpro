import Script from 'next/script';

type GoogleAnalyticsProps = {
  measurementId: string;
};

/**
 * Consent Mode v2 defaults (denied) before gtag.js, then GA4 config.
 * Only render on marketing routes when NEXT_PUBLIC_GA_ID is set.
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const id = JSON.stringify(measurementId);

  return (
    <>
      <Script id="consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent','default',{
          ad_storage:'denied',
          ad_user_data:'denied',
          ad_personalization:'denied',
          analytics_storage:'denied',
          functionality_storage:'granted',
          security_storage:'granted',
          wait_for_update:500
        });
        gtag('set','ads_data_redaction',true);
        try {
          var raw = localStorage.getItem('ftp_consent');
          if (raw) {
            var c = JSON.parse(raw);
            if (c && c.v === 2 && c.analytics === 'granted') {
              gtag('consent','update',{ analytics_storage:'granted' });
            }
          }
        } catch (e) {}
      `}</Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = window.gtag || gtag;
        gtag('js', new Date());
        gtag('config', ${id}, { send_page_view: false, anonymize_ip: true });
      `}</Script>
    </>
  );
}
