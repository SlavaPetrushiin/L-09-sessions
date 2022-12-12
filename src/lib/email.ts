import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';
dotenv.config();

class EmailSend {
	public async sendEmail(email: string, url: string) {

		let pass = process.env.NODEMAILER_PASS;
		let emailPas = process.env.NODEMAILER_EMAIL;

		let transporter = nodemailer.createTransport({
			
			service: 'gmail',
			auth: {
				user: emailPas, //process.env.NODEMAILER_EMAIL,
				pass: pass //process.env.NODEMAILER_PASS,
			},
			tls: { rejectUnauthorized: false },
			secure: false, // true for 465, false for other ports

		});

		try {
			let info = await transporter.sendMail({
				from: "slava91petrushin@yandex.ru", 
				to: email,
				html: url,
			});
			console.log("INFO: ", info);
			return true;
		} catch (error) {
			console.log("ERROR: ", error);
			return false;
		}
	}
}

export let Email = new EmailSend();