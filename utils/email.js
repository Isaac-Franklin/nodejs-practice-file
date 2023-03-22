const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    const transporter = nodemailer.createTransport = ({
        // Define email sending parameter from email relar software - (to use gmail, activate less secure app option)
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "c06cf0f4cdcf7c",
            pass: "8da62623d2ecfd"
        }
    })

    // Define email sending options
    const mailOptions = {
        from: 'Franklin Isaac <franklin@it.dev>',
        to: options.email,
        subject: options.subject,
        text: options.text
    }

    // send email proper
    await transporter.sendMail(mailOptions)
}


module.exports = sendEmail

/*
PROCEDURE FOR SENDING MAIL WITH NODEMAILER
1. Configure email sending parameters. The host, port and auth(user and pass) 
- To use Gmail, I'll have to activate .less secure app' option.
2. Define email options: FROM, TO, SUBJECT, TEXT.
3. send email proper.
*/