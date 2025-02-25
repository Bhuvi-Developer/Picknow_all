import nodemailer from 'nodemailer';

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
};

export default sendMail; 