const nodemailer = require("nodemailer");

const email = {
  "host": "smtp.mailtrap.io",
  "port": 2525,
  "secure": false,
  "auth": {
    "user": "3aa35ce103ada8", // generated ethereal user
    "pass": "358c23acf3cc9c", // generated ethereal password
  },
}

const send = async (data) => {
  nodemailer.createTransport(email).sendMail(data, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log(info);
      return info.response
    }
  });
};

const content = {
  from: "umkyungil@gmail.com",
  to : "29bd19d302-46b5cc@inbox.mailtrap.io",
  subject: "test",
  text: "test"
}

send(content);