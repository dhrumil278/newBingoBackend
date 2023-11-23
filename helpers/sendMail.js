const nodemailer = require('nodemailer');
const ejs = require('ejs');
const sendMail = async (data) => {
  try {
    console.log('sendMail called...');
    const template = await ejs.renderFile('./Templates/otp.ejs', {
      otp: data.otp,
    });

    // transporter for the Node Mailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'demo.zignuts@gmail.com',
        pass: 'rjgsrbwbdvykvosd',
      },
    });

    const options = {
      from: 'demo.zignuts@gmail.com',
      to: data.email,
      subject: 'Welcome to Bingo Universe..!',
      html: template,
    };

    const info = await transporter.sendMail(options);
    if (info) {
      return {
        hasError: false,
      };
    }
  } catch (error) {
    console.log('error: ', error);
    return {
      hasError: true,
    };
  }
};

module.exports = {
  sendMail,
};
