const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API)


//forgot mail
const sendActivationEmail = async(to,token)=>{

    const message={
      to:to,
      from:"aadil.shafi02@gmail.com",
      subject:"Activation Code for Social Me",
      text: `Thanks for creating account with us. In case link not appear then copy paste this below link, \n \n http://localhost:3000/account-verification/${to}/${token}`,
      html:`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Social Me - Account Activation</title>
      </head>
      <body>
          <div style="justify-content: center; text-align: center; padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
          ">
      <h1 style="color: purple;">Social Me</h1>
      <h3>Account Activation Mail</h3>
      <p>Thans for creating an account with us. We wish you a wonderful journey up ahead.</p>
      <hr>
      <p>Use this link verify account:</p>
                  <a href="http://localhost:3000/account-verification/${to}/${token}" target="_blank" style="background-color: palevioletred; color: white; padding:10px; text-decoration: none;">Click to verify</a>
                  <hr>
                  <p>In case of any query please contact us at: md.aadil.shafi@gmail.com</p>
                  <p style="font-weight: lighter;">&copy; Social Me.</p>
          </div>
      </body>
      </html>
      `
    }
  try{
    await sgMail.send(message)
    console.log('Email sent')
    
  }catch(err){
    console.log('Error, sending mail..')
  }
    
  }


  
  module.exports = sendActivationEmail ;