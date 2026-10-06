export const socialMediaConverter = (data) => {
    const socialMedias = [];

    // Process Telegram phone number
    if (data.telegramPhoneNo) {
        socialMedias.push({
            name: data.telegramPhoneNo,
            type: "TELEGRAM_PHONE_NO"
        });
    }

    // Process Telegram ID
    if (data.telegramId) {
        socialMedias.push({
            name: data.telegramId,
            type: "TELEGRAM_ID"
        });
    }

    // Process WhatsApp phone number
    if (data.whatsAppPhoneNo) {
        socialMedias.push({
            name: data.whatsAppPhoneNo,
            type: "WHATSAPP_PHONE_NO"
        });
    }

    // Process WhatsApp ID
    if (data.whatsAppId) {
        socialMedias.push({
            name: data.whatsAppId,
            type: "WHATSAPP_ID"
        });
    }

    // Process Instagram ID
    if (data.instagramId) {
        socialMedias.push({
            name: data.instagramId,
            type: "INSTAGRAM_ID"
        });
    }

    // Process LinkedIn ID
    if (data.linkedInId) {
        socialMedias.push({
            name: data.linkedInId,
            type: "LINKEDIN_ID"
        });
    }

    // Process Eitaa phone number
    if (data.eitaaPhoneNo) {
        socialMedias.push({
            name: data.eitaaPhoneNo,
            type: "EITAA_PHONE_NO"
        });
    }

    // Process Rubika phone number
    if (data.rubikaPhoneNo) {
        socialMedias.push({
            name: data.rubikaPhoneNo,
            type: "RUBIKA_PHONE_NO"
        });
    }

    // Process Website
    if (data.website) {
        socialMedias.push({
            name: data.website,
            type: "WEBSITE"
        });
    }

    // Process Emails
    if (data.emails && Array.isArray(data.emails)) {
        data.emails.forEach(email => {
            if (email && email.trim()) {
                socialMedias.push({
                    name: email,
                    type: "EMAIL"
                });
            }
        });
    }

    return socialMedias;
};