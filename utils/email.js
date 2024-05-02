const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')


module.exports = class Email {
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,

        this.from  = `Vaibhav Vyas <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            // sendGrid
            return 1;
        }

        return nodemailer.createTransport({
            // service : 'gmail',     // App password : gtkw kldx elml jktm
            host : process.env.EMAIL_HOST,
            post : process.env.EMAIL_PORT,
            auth : {
                user: process.env.EMAIL_USERNAME,
                pass : process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(templete, subject){

        const html = pug.renderFile(`${__dirname}/../views/${templete}.pug`,{
            firstName : this.firstName,
            url : this.url,
            subject
        })


        const mailOptions = {
            from : "Vaibhav Vyas <vyasvaibhav839@gmail.com>",
            to : this.to,
            subject : subject,
            text : htmlToText.convert(html),
            html : html
        }

        
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welocom to natous')
    }

    async sendPassReset(){
        await this.send('passwordReset', 'Natours : Password reset link from')
    }
}

