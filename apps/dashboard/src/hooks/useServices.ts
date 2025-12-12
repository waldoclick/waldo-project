import { Globe, Search } from 'lucide-react';
import {
  SiGoogletagmanager,
  SiGoogleanalytics,
  SiRocket,
  SiZoho,
  SiSentry,
  SiHotjar,
  SiSlack,
  SiCodacy,
  SiBetterstack,
} from 'react-icons/si';

export interface Service {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

export function useServices(): Service[] {
  return [
    {
      name: 'Waldo.click',
      icon: Globe,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://waldo.click',
    },
    {
      name: 'GTM',
      icon: SiGoogletagmanager,
      url: 'https://tagmanager.google.com/#/container/accounts/6223279087/containers/180879945/workspaces/3',
    },
    {
      name: 'GA4',
      icon: SiGoogleanalytics,
      url: 'https://analytics.google.com/analytics/web/#/a307524661p433494628/reports/intelligenthome?params=_u..nav%3Dmaui',
    },
    {
      name: 'GSC',
      icon: Search,
      url: 'https://search.google.com/search-console?resource_id=sc-domain:waldo.click',
    },
    {
      name: 'LogRocket',
      icon: SiRocket,
      url: 'https://app.logrocket.com/myogth/waldo',
    },
    {
      name: 'Zoho CRM',
      icon: SiZoho,
      url: 'https://crm.zoho.com/crm/org887031527/tab/Home/begin',
    },
    {
      name: 'Sentry',
      icon: SiSentry,
      url: 'https://waldoclick.sentry.io/',
    },
    {
      name: 'Hotjar',
      icon: SiHotjar,
      url: 'https://insights.hotjar.com/sites/3930955/dashboard/JpTEccG3M2dvwHDV77dBaW-Vista-general-del-sitio-web',
    },
    {
      name: 'Slack',
      icon: SiSlack,
      url: 'https://waldoclick.slack.com',
    },
    {
      name: 'Codacy',
      icon: SiCodacy,
      url: 'https://app.codacy.com/organizations/gh/waldoclick',
    },
    {
      name: 'Better Stack',
      icon: SiBetterstack,
      url: 'https://uptime.betterstack.com/team/t324583/incidents',
    },
  ];
}
