export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [
        "http://localhost:3000", // ваш локальний домен React-аплікації
        "https://svitli-idei.vercel.app/", // замініть на ваш реальний домен Vercel
        "https://svitli-idei-60qv0q0eu-sandro-its-projects.vercel.app",
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
