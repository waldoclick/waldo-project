# Documentation for `package.json`

This document provides an overview and explanation of the `package.json` file for the Nuxt.js application.

## General Information

- **name**: The name of the project.
- **private**: Indicates that the project is private and should not be published to npm.
- **type**: Specifies the module type. In this case, it is set to `module` for ES modules.

## Scripts

The `scripts` section contains various commands that can be run using `npm run <script>`:

- **fetch**: Runs the `data.js` script located in the `scripts` directory.
- **build**: Builds the Nuxt.js application for production.
- **develop**: Starts the Nuxt.js development server.
- **generate**: Generates a static version of the Nuxt.js application.
- **preview**: Previews the generated static application.
- **postinstall**: Runs `nuxt prepare` after dependencies are installed.
- **format**: Formats the codebase using Prettier, ignoring files specified in `.gitignore`.

## Dependencies

The `dependencies` section lists the packages required for the application to run:

- **@nuxtjs/dotenv**: Loads environment variables from a `.env` file.
- **@nuxtjs/strapi**: Integrates Strapi with Nuxt.js.
- **@pinia-plugin-persistedstate/nuxt**: Pinia plugin for persisting state in Nuxt.js.
- **@pinia/nuxt**: Integrates Pinia with Nuxt.js.
- **floating-vue**: A Vue.js plugin for tooltips, popovers, dropdowns, and more.
- **fs**: Node.js file system module.
- **headroom.js**: A JavaScript library for hiding and revealing the header on scroll.
- **js-cookie**: A JavaScript library for handling cookies.
- **nuxt**: The Nuxt.js framework.
- **pinia**: A state management library for Vue.js.
- **pinia-plugin-persistedstate**: A plugin for persisting Pinia state.
- **sass-mq**: A Sass mixin for handling media queries.
- **sweetalert2**: A library for creating beautiful, responsive, customizable, and accessible (WAI-ARIA) replacement for JavaScript's popup boxes.
- **ts-node**: TypeScript execution environment and REPL for Node.js.
- **typescript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **vee-validate**: A form validation library for Vue.js.
- **vue**: The Vue.js framework.
- **vue-awesome-paginate**: A Vue.js pagination component.
- **vue-easy-lightbox**: A Vue.js lightbox component.
- **vue-headroom**: A Vue.js component for headroom.js.
- **vue-router**: The official router for Vue.js.
- **yup**: A JavaScript schema builder for value parsing and validation.

## DevDependencies

The `devDependencies` section lists the packages required for development:

- **fibers**: A library for creating and managing fibers, which are units of execution that can be paused and resumed.
- **sass**: A CSS preprocessor that adds power and elegance to the basic language.
- **sass-loader**: A loader for webpack that compiles Sass to CSS.

## License

This project is licensed under the MIT License.
