import nodemailer from 'nodemailer'
export async function sendEmail(dest, subject, message ) {
    
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.nodeMailerEmail, // generated ethereal user
            pass: process.env.nodeMailerPassword, // generated ethereal password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Samar" < ${process.env.nodeMailerEmail}>`, // sender address
        to: dest, // list of receivers
        subject, // Subject line
        html: message // html body
        
    });
    return info
}
