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

    // Fire-and-forget: не чекаємо (await) на відповідь Telegram,
    // щоб повільний/недоступний Telegram ніколи не блокував відповідь клієнту.
    (async () => {
      try {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = process.env.TELEGRAM_CHAT_ID;

        if (telegramToken && telegramChatId) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: message,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);
        }
      } catch (error) {
        strapi.log.error("Помилка відправки Telegram-сповіщення:", error);
      }
    })();
  },
};
