import 'dotenv/config'; 
import multipart from 'parse-multipart-data';
import nodemailer from 'nodemailer';
import { SESClient } from '@aws-sdk/client-ses';

export async function handler (event) {

  try{
    if (event.requestContext.http.method === 'OPTIONS'){
      return {
        statusCode: 200
      }
    }
    if (event.requestContext.http.method === 'POST'){
      //get content-header type 
      const contentHeader = event.headers['content-type'] || event.headers['Content-Type'];
      // Extract boundary string from content-header(separate data into array)
      const boundary = contentHeader.split('boundary=')[1];
      // convert base64 to binary
      const bodyBuffer = Buffer.from(event.body, 'base64');
      //parse multipart data using boundary
      const parts = multipart.parse(bodyBuffer, boundary);

      const userName = parts.find(part => part.name === 'name')
      const userEmail = parts.find(part => part.name === 'email')
      const date =  parts.find(part => part.name === 'date')
      const description = parts.find(part => part.name === 'description');
      const photo = parts.find(part => part.name === 'photo');
      
      if (!userName || !userEmail|| !date || !description || !photo) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required fields" })
        };
      }

      const nameValue = userName.data.toString();;
      const emailValue = userEmail.data.toString();
      const dateValue = date.data.toString(); 
      const descriptionValue = description.data.toString(); 
      const photoData = photo.data;
      const photoFileName = photo.filename; 


      //Change amazonSESFullAccess policy to custom policy when in production
      const ses = new SESClient({ region: 'us-west-2'})

      //create nodemailer transport using SES
      const transport = nodemailer.createTransport({
        SES: { ses }
      });

      const mail = {
        from: process.env.SENDER_EMAIL, // need to change to domain purchased later
        replyTo: emailValue, 
        to: process.env.ARTIST_EMAIL,
        subject: 'New tattoo appointment request',
        text: `
          New appointment:

          Name: ${nameValue}
          Email: ${emailValue}
          Date: ${dateValue}

          Description : ${descriptionValue}
        `,
        attachments: [
          {
            filename: photoFileName,
            content: photoData,
            contentType: photo.type
          }
        ]
      };
      const sent = await transport.sendMail(mail)
      console.log('Email sent!', sent); 

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Reference sent to artist'})
      }; 
    };

    if (event.requestContext.http.method ==='DELETE'){
      const { cancelName, cancelEmail, formattedCancelDate, appointmentTime } =
      JSON.parse(event.body);

      const deleteSES = new SESClient({region: 'us-west-2'})

      const transport = nodemailer.createTransport({
        SES: { ses: deleteSES }
      })

      const deletionmail = {
        from: process.env.SENDER_EMAIL,
        replyTo: cancelEmail,
        to: process.env.ARTIST_EMAIL,
        subject: 'Appointment Canceled', 
        text: `
            Appointment canceled for:

            Name: ${cancelName}
            Date: ${formattedCancelDate}
            Time :${appointmentTime}
        `
      }
      const deleted = await transport.sendMail(deletionmail)
      console.log('Deleted email sent: ', deleted)

      return {
        statusCode: 200,
        body: JSON.stringify('Deletion email sent')
      }
    };
      
  } catch (error) {
    console.log('Error sending to artist: ', error)
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error sending to artist'})
    }
  }
};