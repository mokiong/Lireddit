   import nodemailer from "nodemailer";

   export async function sendEmail(sendTo: string, emailBody: string) {
   
   // let testAccount = await nodemailer.createTestAccount();
   //    console.log("accoun: ",testAccount);

   // create reusable transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
         user: "ar3syc6qpfoattn5@ethereal.email", // generated ethereal user
         pass: "Gc9RRJzgZ3kfghyeCU", // generated ethereal password
      },
      tls: {
          rejectUnauthorized: false
      }
   });

   // send mail with defined transport object
   let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: sendTo, // list of receivers
      subject: "Change password", // Subject line
      html: emailBody
   });

   console.log("Message sent: %s", info.messageId);
   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}