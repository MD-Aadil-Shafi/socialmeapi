const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API)


//forgot mail
const sendSgWelcomeMail = async(to,user)=>{

    const message={
      to:to,
      from:"aadil.shafi02@gmail.com",
      subject:"Welcome to Blogify",
      text: `Hi, ${user}, \n A one stop place for quality blog posts`,
      html:`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="width:100%; border-radius: 15px; text-align: center; color:white; margin: 0; font-family: 'Courier New', Courier, monospace; background-image: linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12);">
        <br>
        <h2>Welcome to Blogify</h2>
        <h3>Hi, ${user}</h3>
        <h4>Dive into our rich blog posts by professionals</h4>
        <h3>Hoping a joyful journey with you ahead</h3>
        <h6>Thanks &amp; Regards, </h6>
        <h6>Team Blogify</h6>
        <br>
    </div>
</body>
</html>
      `
    }
  try{
    await sgMail.send(message)
    console.log('Email sent')
    return true;
    
  }catch(err){
    console.log('Error, sending mail..')
    return false;
  }
    
  }


  
  module.exports = sendSgWelcomeMail;