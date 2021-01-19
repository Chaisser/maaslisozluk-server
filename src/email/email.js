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

const sendActivationEmail = (email, emailActivationCode, id) => {
  sgMail.send({
    to: email,
    from: "info@maaslisozluk.com",
    subject: "maaşlı sözlük e-posta onaylama",
    text: "Bu e-posta size maaslisozluk tarafından e-posta onay kodunu değiştirmek istediğiniz için gönderilmiştir",
    html: `<p>merhaba,</p><p><strong>aktivasyon kodunuz ${emailActivationCode} </strong></p><p>aktivasyon için <a href="https://www.maaslisozluk.com/aktivasyon?kod=${emailActivationCode}&email=${email}&id=${id}">buraya tıklayabilirsiniz</a></p>`,
  });
};

export { sendWelcomeEmail, sendActivationEmail };
