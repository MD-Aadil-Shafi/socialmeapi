const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API)


//forgot mail
const sendSgForgotMail= async(to,token)=>{

    const message={
      to:to,
      from:"aadil.shafi02@gmail.com",
      subject:"Password Reset Mail from Social Me",
      text: `Here's your newly generated password link: ${token}`,
      html:`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Social Me - Password Reset</title>
      </head>
      <body>
          <div style="justify-content: center; text-align: center; padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
          ">
      <h1 style="color: purple;">Social Me</h1>
      <h3>Password Reset Mail</h3>
      <p>You are receiving this mail as you have requested to reset your password</p>
      <p style="font-weight: bold;">NOTE:</p>
      <p>If you haven't requested to reset your password. Please inform us the below mentioned mail address.</p>
      <hr>
      <h2>Your new passowrd is : <span style="font-weight: bold;">${token}</span></h2>
      <p>You can change your password from your profile-> account section.</p>
                  <a href="http://localhost:3000/login" target="_blank" style="background-color: palevioletred; color: white; padding:10px; text-decoration: none;">Click to login</a>
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


  
  module.exports = sendSgForgotMail;