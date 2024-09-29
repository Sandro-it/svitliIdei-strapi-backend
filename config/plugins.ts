export default ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET", "your-default-secret"),
    },
  },
  upload: {
    config: {
      provider: "@strapi/provider-upload-cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
      // breakpoints: {
      //   large: 1920, // Єдиний розмір зображення, який буде зберігатися
      // },
    },
  },
});
