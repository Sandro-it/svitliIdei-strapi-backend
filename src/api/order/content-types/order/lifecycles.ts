export default {
  async afterCreate(event: any) {
    const { result } = event;

    const deliveryLabels: Record<string, string> = {
      branch: "Відділення",
      postomat: "Поштомат",
      courier: "Кур'єр",
    };

    const itemsList = (result.items || [])
      .map((item: any) => `• ${item.name} — ${item.quantity} x ${item.price} грн`)
      .join("\n");

    const message = [
      `🛍 Нове замовлення №${result.id}`,
      `Ім'я: ${result.recipientName}`,
      `Телефон: ${result.recipientPhone}`,
      `Доставка: ${deliveryLabels[result.deliveryMethod] || result.deliveryMethod}`,
      result.novaPoshtaCity ? `Місто: ${result.novaPoshtaCity}` : null,
      result.novaPoshtaWarehouse ? `Відділення: ${result.novaPoshtaWarehouse}` : null,
      result.comment ? `Коментар: ${result.comment}` : null,
      "",
      itemsList,
      "",
      `Разом: ${result.totalPrice} грн`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.TELEGRAM_CHAT_ID;

      if (telegramToken && telegramChatId) {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
          }),
        });
      }
    } catch (error) {
      strapi.log.error("Помилка відправки Telegram-сповіщення:", error);
    }

    try {
      await strapi.plugins["email"].services.email.send({
        to: process.env.ORDER_NOTIFICATION_EMAIL,
        subject: `Нове замовлення №${result.id} — SvitliIdei`,
        text: message,
      });
    } catch (error) {
      strapi.log.error("Помилка відправки email-сповіщення:", error);
    }
  },
};
