export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (!config.public.zohoChat || !config.public.zohoWidgetCode) {
    return;
  }

  const widgetCode = config.public.zohoWidgetCode as string;

  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq = window.$zoho.salesiq || {
    widgetcode: widgetCode,
    values: {},
    ready: function () {},
  };

  const d = document;
  const s = d.createElement("script");
  s.type = "text/javascript";
  s.id = "zsiqscript";
  s.defer = true;
  s.src = "https://salesiq.zohopublic.com/widget";
  const t = d.getElementsByTagName("script")[0] as
    | HTMLScriptElement
    | undefined;
  if (t?.parentNode) {
    t.parentNode.insertBefore(s, t);
  } else {
    d.head.appendChild(s);
  }
});
