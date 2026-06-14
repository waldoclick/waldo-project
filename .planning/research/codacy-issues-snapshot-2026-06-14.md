# Codacy Issues — waldo-project (snapshot 2026-06-14)

Total: 100 issues

## Security/Error — Semgrep_rules_lgpl_javascript_database_rule-node-nosqli-injection (36)
_Untrusted user input in findOne() function can result in NoSQL Injection._
- apps/strapi/src/api/ad-featured-reservation/controllers/ad-featured-reservation.ts:12  (Opengrep)
- apps/strapi/src/api/ad/services/ad.ts:1141  (Opengrep)
- apps/strapi/src/api/ad-reservation/controllers/ad-reservation.ts:12  (Opengrep)
- apps/strapi/src/services/google-one-tap/google-one-tap.service.ts:40  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:209  (Opengrep)
- apps/strapi/src/api/condition/content-types/condition/lifecycles.ts:32  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/userController.ts:154  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:396  (Opengrep)
- apps/strapi/src/cron/subscription-charge.cron.ts:164  (Opengrep)
- apps/strapi/src/api/payment/utils/user.utils.ts:49  (Opengrep)
- apps/strapi/src/api/payment/controllers/payment.ts:449  (Opengrep)
- apps/strapi/src/api/ad/controllers/ad.ts:104  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:750  (Opengrep)
- apps/strapi/src/bootstrap/migrate-subscription-pro.ts:35  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/usernameUpdateController.ts:4  (Opengrep)
- apps/strapi/src/middlewares/user-registration.ts:142  (Opengrep)
- apps/strapi/src/api/commune/content-types/commune/lifecycles.ts:19  (Opengrep)
- apps/strapi/src/middlewares/user-registration.ts:102  (Opengrep)
- apps/strapi/src/middlewares/user-registration.ts:106  (Opengrep)
- apps/strapi/src/cron/subscription-charge.cron.ts:174  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:425  (Opengrep)
- apps/strapi/src/api/payment/controllers/payment.ts:419  (Opengrep)
- apps/strapi/src/api/order/controllers/order.ts:395  (Opengrep)
- apps/strapi/src/api/region/content-types/region/lifecycles.ts:19  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/userController.ts:87  (Opengrep)
- apps/strapi/src/api/ad/controllers/ad.ts:567  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:231  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:598  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/userController.ts:119  (Opengrep)
- apps/strapi/src/api/article/content-types/article/lifecycles.ts:28  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:340  (Opengrep)
- apps/strapi/src/api/payment/services/checkout.service.ts:112  (Opengrep)
- apps/strapi/src/api/payment/services/checkout.service.ts:191  (Opengrep)
- apps/strapi/src/api/ad/controllers/ad.ts:566  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/userController.ts:79  (Opengrep)
- apps/strapi/src/api/category/content-types/category/lifecycles.ts:19  (Opengrep)

## Security/Error — Semgrep_javascript_pathtraversal_rule-non-literal-fs-filename (17)
_The application dynamically constructs file or path information._
- apps/strapi/src/services/indicador/indicador.service.ts:32  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:128  (Opengrep)
- apps/strapi/src/middlewares/image-uploader.ts:27  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:20  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:24  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:19  (Opengrep)
- apps/strapi/src/services/indicador/indicador.service.ts:33  (Opengrep)
- apps/strapi/src/middlewares/image-uploader.ts:33  (Opengrep)
- apps/strapi/src/middlewares/image-uploader.ts:88  (Opengrep)
- apps/strapi/src/middlewares/image-uploader.ts:111  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:206  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:217  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:34  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:29  (Opengrep)
- apps/strapi/src/services/weather/weather.service.ts:23  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:126  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:220  (Opengrep)

## Security/Error — Semgrep_javascript.vue.security.audit.xss.templates.avoid-v-html.avoid-v-html (14)
_Dynamically rendering arbitrary HTML on your website can be very dangerous because it can easily lead to XSS vulnerabilities._
- apps/website/app/components/AccountMain.vue:29  (Opengrep)
- apps/website/app/components/AccountMain.vue:23  (Opengrep)
- apps/website/app/components/ArticleSingle.vue:10  (Opengrep)
- apps/website/app/components/PacksDefault.vue:4  (Opengrep)
- apps/website/app/components/IntroduceAuth.vue:7  (Opengrep)
- apps/website/app/components/CardCategory.vue:8  (Opengrep)
- apps/website/app/components/AccountMain.vue:22  (Opengrep)
- apps/website/app/components/IntroduceAuth.vue:9  (Opengrep)
- apps/website/app/components/AdSingle.vue:13  (Opengrep)
- apps/website/app/components/CardHighlight.vue:12  (Opengrep)
- apps/website/app/components/AccordionDefault.vue:26  (Opengrep)
- apps/website/app/components/MessageDefault.vue:12  (Opengrep)
- apps/website/app/components/CardHighlight.vue:13  (Opengrep)
- apps/website/app/components/CardPack.vue:14  (Opengrep)

## BestPractice/High — ESLint8_@typescript-eslint_no-explicit-any (9)
_Unexpected any. Specify a different type._
- apps/strapi/src/types/koa.d.ts:10  (ESLint)
- apps/website/tests/stubs/nitro-globals.ts:9  (ESLint)
- apps/strapi/src/services/better-stack/services/better-stack.service.ts:63  (ESLint)
- apps/strapi/src/services/cloudflare/services/cloudflare.service.ts:24  (ESLint)
- apps/website/tests/stubs/nitro-globals.ts:27  (ESLint)
- apps/website/tests/stubs/nitro-globals.ts:23  (ESLint)
- apps/strapi/src/services/better-stack/services/better-stack.service.ts:45  (ESLint)
- apps/website/tests/stubs/nitro-globals.ts:14  (ESLint)
- apps/strapi/src/services/cloudflare/services/cloudflare.service.ts:43  (ESLint)

## Security/Error — Semgrep_generic.secrets.gitleaks.hashicorp-tf-password.hashicorp-tf-password (9)
_A gitleaks hashicorp-tf-password was detected which attempts to identify hard-coded credentials._
- apps/website/app/components/FormPassword.vue:139  (Opengrep)
- apps/website/app/components/FormPasswordDashboard.vue:120  (Opengrep)
- apps/website/app/components/FormPasswordDashboard.vue:130  (Opengrep)
- apps/website/app/components/FormDev.vue:77  (Opengrep)
- apps/website/app/components/FormLogin.vue:110  (Opengrep)
- apps/website/app/components/FormPasswordDashboard.vue:125  (Opengrep)
- apps/website/app/components/FormResetPassword.vue:150  (Opengrep)
- apps/website/app/components/FormRegister.vue:339  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:562  (Opengrep)

## Security/Error — Semgrep_javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal (4)
_Detected possible user input going into a `path.join` or `path.resolve` function._
- apps/strapi/src/cron/bbdd-backup.cron.ts:183  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:169  (Opengrep)
- apps/strapi/config/database.ts:58  (Opengrep)
- apps/strapi/src/cron/bbdd-backup.cron.ts:147  (Opengrep)

## Security/Error — Semgrep_rules_lgpl_javascript_crypto_rule-node-insecure-random-generator (3)
_This rule identifies use of cryptographically weak random number generators._
- apps/website/app/utils/password.ts:45  (Opengrep)
- apps/strapi/src/extensions/users-permissions/controllers/authController.ts:290  (Opengrep)
- apps/website/app/utils/password.ts:31  (Opengrep)

## Security/Error — Semgrep_rules_lgpl_javascript_ssrf_rule-node-ssrf (2)
_This application allows user-controlled URLs to be passed directly to HTTP client libraries._
- apps/strapi/src/services/zoho/http-client.ts:17  (Opengrep)
- apps/strapi/src/services/better-stack/services/better-stack.service.ts:28  (Opengrep)

## Security/Error — Semgrep_javascript.lang.security.audit.unsafe-dynamic-method.unsafe-dynamic-method (1)
_Using non-static data to retrieve and run functions from the object is dangerous._
- apps/strapi/src/services/payment-gateway/registry.ts:15  (Opengrep)

## UnusedCode/Warning — ESLint8_@typescript-eslint_no-unused-vars (1)
_'mockSubPayCreate' is assigned a value but never used. Allowed unused vars must match /^_/u._
- apps/strapi/tests/api/payment/controllers/payment.test.ts:98  (ESLint)

## Security/Error — Semgrep_javascript.browser.security.open-redirect-from-function.js-open-redirect-from-function (1)
_The application accepts potentially user-controlled input `provider` which can control the location of the current window context._
- apps/website/app/composables/useProviders.ts:7  (Opengrep)

## Security/Error — Semgrep_rules_lgpl_javascript_traversal_rule-generic-path-traversal (1)
_This application is using untrusted user input with the readFile() and readFileSync() functions._
- apps/strapi/src/middlewares/image-uploader.ts:27  (Opengrep)

## Security/Error — Semgrep_generic.secrets.security.detected-generic-api-key.detected-generic-api-key (1)
_Generic API Key detected_
- apps/strapi/jest.setup.ts:4  (Opengrep)

## Security/Error — Semgrep_javascript_dos_rule-non-literal-regexp (1)
_The `RegExp` constructor was called with a non-literal value._
- apps/website/app/composables/useValidation.ts:157  (Opengrep)
