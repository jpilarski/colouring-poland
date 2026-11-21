import * as nodemailer from 'nodemailer';

const hasAuth = Boolean(process.env.MAIL_SERVER_USER);

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER_HOST,
    port: process.env.MAIL_SERVER_PORT == undefined || process.env.MAIL_SERVER_PORT === ''
        ? undefined
        : parseInt(process.env.MAIL_SERVER_PORT, 10),
    secure: process.env.MAIL_SERVER_SECURE === 'true',
    ...(hasAuth
        ? {
            auth: {
                user: process.env.MAIL_SERVER_USER,
                pass: process.env.MAIL_SERVER_PASSWORD
            }
        }
        : {})
});

export {
    transporter
};
