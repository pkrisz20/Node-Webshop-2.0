const { db } = require("../config/db-config");
const nodemailer = require("nodemailer");
const moment = require("moment");

const handleContactMessage = (req, res) => {
    const { firstName, lastName, email, phone, clientMessage } = req.body;
    moment.locale("hu");

    db.query("INSERT INTO contact_messages (first_name, last_name, email, phone, client_message, date) VALUES (?,?,?,?,?,?)", [firstName, lastName, email, phone, clientMessage, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (result) {

            var smtpTransport = nodemailer.createTransport("SMTP", {
                service: "Gmail",
                auth: {
                    XOAuth2: {
                        user: process.env.EMAIL_ADDRESS,
                        clientId: process.env.EMAIL_CLIENT_ID,
                        clientSecret: process.env.EMAIL_CLIENT_SECRET,
                        refreshToken: process.env.EMAIL_REFRESH_TOKEN
                    }
                }
            });

            var mailOptions = {
                from: email,
                to: process.env.EMAIL_ADDRESS,
                subject: `Üzenet egy klienstől (${ firstName })`,
                html: `
                <html>
                    <head></head>
                    <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
                        <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
                            <h1>${ firstName } ${ lastName } üzenete</h1>
                            <div style="height: 5px; background-color: #fff"></div>
                        </div>
                        <div style="padding: 50px 0; text-align: left;">
                            <p style="font-size: 16px; margin-bottom: 10px;"><u>Üzenet:</u> ${ clientMessage }</p><br>
                            <p style="font-size: 16px; margin-bottom: 10px;"><u>Elérhetőség:</u> <b>${ phone }</b> vagy <b>${ email }</b></p><br>
                            <p style="font-size: 16px;"><u>A küldés időpontja:</u> <b>${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</b></p>
                        </div>
                    </body>
                </html>`,
            };

            smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ status: "error" });
                }
                else {
                    console.log(response);
                    console.log("Email sent");
                }

                smtpTransport.close();
                return res.status(200).json({ status: "success" });
            });
        }
    });
}

module.exports = { handleContactMessage };
