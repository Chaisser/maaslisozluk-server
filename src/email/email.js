const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeEmail = (email, emailActivationCode) => {
  sgMail.send({
    to: email,
    from: "info@maaslisozluk.com",
    subject: "maaşlı sözlük'te mesai başladı",
    text: "Bu e-posta size maaslisozluk tarafından üye olduğunuz için gönderilmiştir",
    html: `<p>merhaba,</p><p><strong>aktivasyon kodunuz ${emailActivationCode} </strong>`,
  });
};

export { sendWelcomeEmail };
