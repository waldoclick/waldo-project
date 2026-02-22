/**
 * Lista de servicios externos para el menú "Servicios" del header.
 * Todos usan iconos Lucide por nombre (Globe, Search, BarChart2, etc.).
 */
export interface ServiceItem {
  name: string;
  url: string;
  /** Nombre del componente Lucide (Globe, Search, Rocket, etc.) */
  icon: string;
}

export function useServices(): ServiceItem[] {
  const config = useRuntimeConfig().public;
  const websiteUrl = config.websiteUrl || "https://waldo.click";

  return [
    {
      name: "Waldo.click",
      url: websiteUrl,
      icon: "Globe",
    },
    {
      name: "GTM",
      url: "https://tagmanager.google.com/#/container/accounts/6223279087/containers/180879945/workspaces/3",
      icon: "LayoutGrid",
    },
    {
      name: "GA4",
      url: "https://analytics.google.com/analytics/web/#/a307524661p433494628/reports/intelligenthome?params=_u..nav%3Dmaui",
      icon: "BarChart2",
    },
    {
      name: "GSC",
      url: "https://search.google.com/search-console?resource_id=sc-domain:waldo.click",
      icon: "Search",
    },
    {
      name: "LogRocket",
      url: "https://app.logrocket.com/myogth/waldo",
      icon: "Rocket",
    },
    {
      name: "Zoho CRM",
      url: "https://crm.zoho.com/crm/org887031527/tab/Home/begin",
      icon: "Building2",
    },
    {
      name: "Sentry",
      url: "https://waldoclick.sentry.io/",
      icon: "TriangleAlert",
    },
    {
      name: "Hotjar",
      url: "https://insights.hotjar.com/sites/3930955/dashboard/JpTEccG3M2dvwHDV77dBaW-Vista-general-del-sitio-web",
      icon: "Activity",
    },
    {
      name: "Slack",
      url: "https://waldoclick.slack.com",
      icon: "MessageCircle",
    },
    {
      name: "Codacy",
      url: "https://app.codacy.com/organizations/gh/waldoclick",
      icon: "ShieldCheck",
    },
    {
      name: "Better Stack",
      url: "https://uptime.betterstack.com/team/t324583/incidents",
      icon: "Layers",
    },
  ];
}
