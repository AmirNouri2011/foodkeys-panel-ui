export const socialMediaConverter = (formValues: { [x: string]: any; }) => {
    const socialMediaKeys = [
        {key: 'telegramPhoneNo', type: 'TELEGRAM_PHONE_NO'},
        {key: 'telegramId', type: 'TELEGRAM_ID'},
        {key: 'whatsAppPhoneNo', type: 'WHATSAPP_PHONE_NO'},
        {key: 'whatsAppId', type: 'WHATSAPP_ID'},
        {key: 'instagramId', type: 'INSTAGRAM_ID'},
        {key: 'linkedInId', type: 'LINKEDIN_ID'},
        {key: 'skypeId', type: 'SKYPE_ID'},
        {key: 'eitaaPhoneNo', type: 'EITAA_PHONE_NO'},
        {key: 'rubikaPhoneNo', type: 'RUBIKA_PHONE_NO'},
        {key: 'website', type: 'WEBSITE'},
        {key: 'hotlineNumber', type: 'HOTLINE_NUMBER'},
    ];

    const socialMediaList = socialMediaKeys
        .filter(({key}) => formValues[key])
        .map(({key, type}) => ({
            name: formValues[key],
            type,
        }));

    if (formValues.emails && Array.isArray(formValues.emails)) {
        const emailObjects = formValues.emails
            .filter((email) => email)
            .map((email) => ({
                name: email,
                type: 'EMAIL',
            }));
        socialMediaList.push(...emailObjects);
    }
    return socialMediaList
};

// const formValues = {
//     telegramPhoneNo: '09123456789',
//     telegramId: 'foodkeys',
//     whatsAppPhoneNo: '09123456788',
//     whatsAppId: 'arminm4',
//     instagramId: 'foodkeys@',
//     linkedInId: 'foodkeys',
//     skypeId: 'foodkeys',
//     eitaaPhoneNo: '',
//     rubikaPhoneNo: '09123456787',
//     website: 'https://www.foodkeys.com',
// };
//
// const socialMediaObjects = formDataToSocialMediaObjects(formValues);