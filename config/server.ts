export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("PUBLIC_URL"), // Публічний URL тепер використовує значення з .env файлу
  app: {
    keys: env.array("APP_KEYS"),
  },
});
