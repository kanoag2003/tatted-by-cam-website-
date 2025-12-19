import 'dotenv/config'; 
import multipart from 'parse-multipart-data';
import { SESv2Client, SendRawEmailCommand } from "@aws-sdk/client-sesv2";


export async function handler (event) {

  try{
    console.log('Event received:', JSON.stringify(event, null, 2));
    const httpMethod = event.requestContext.http.method; 
    console.log('HTTP method, ', httpMethod); 
    console.log('RequestContext:', event.requestContext);
    

    if (httpMethod === 'OPTIONS'){
      return {
        statusCode: 200
      }
    }
    if (httpMethod === 'POST'){
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
      const time = parts.find(part => part.name === 'time');
      const description = parts.find(part => part.name === 'description');
      const photo = parts.find(part => part.name === 'pdf');
      
      if (!userName || !userEmail|| !date || !time || !description || !photo) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required fields" })
        };
      }

      const nameValue = userName.data.toString();;
      const emailValue = userEmail.data.toString();
      const dateValue = date.data.toString(); 
      const timeValue =time.data.toString();
      const descriptionValue = description.data.toString(); 
      const photoData = photo.data;
      const photoFileName = photo.filename; 


      //Change amazonSESFullAccess policy to custom policy when in production
      const sesClient = new SESv2Client({
        region: 'us-west-2'
      });
      
      const boundary2 = '----=_Part_0_' + Date.now();

      const mail =  [
        `From: ${process.env.SENDER_EMAIL}`,
        `To: ${process.env.ARTIST_EMAIL}`,
        `Reply-To: ${emailValue}`,
        `Subject: New tattoo appointment request`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary2}"`,
        ``,
        `--${boundary2}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        `New appointment:`,
        ``,
        `Name: ${nameValue}`,
        `Email: ${emailValue}`,
        `Date: ${dateValue}`,
        `Time: ${timeValue}`,
        ``,
        `Description: ${descriptionValue}`,
        ``,
        `--${boundary2}`,
        `Content-Type: ${photo.type}`,
        `Content-Disposition: attachment; filename="${photoFileName}"`,
        `Content-Transfer-Encoding: base64`,
        ``,
        photoData.toString('base64'),
        `--${boundary2}--`
      ].join('\r\n');

      const command = new SendRawEmailCommand({
        RawMessage:{
          Data: Buffer.from(mail)
        }
    });

      const result = await sesClient.send(command);
      console.log('Email sent!', result); 


      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Reference sent to artist'})
      }; 
    };

    if (httpMethod ==='DELETE'){
      const { cancelName, cancelEmail, formattedCancelDate, appointmentTime } =
      JSON.parse(event.body);

      

      const sesClient = new SESv2Client({
        region: 'us-west-2'
      });
      const mail = [
        `From: ${process.env.SENDER_EMAIL}`,
        `To: ${process.env.ARTIST_EMAIL}`,
        `Reply-To: ${cancelEmail}`,
        `Subject: Appointment Canceled`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        `Appointment canceled for:`,
        ``,
        `Name: ${cancelName}`,
        `Date: ${formattedCancelDate}`,
        `Time: ${appointmentTime}`
      ].join('\r\n');

      const command = new SendRawEmailCommand({
          RawMessage: {
            Data: Buffer.from(mail)
          }
      });

      const result = await sesClient.send(command);
      console.log('Deletion email sent:', result);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Deletion email sent' })
      }
    }
  } catch (error){
    console.log('Error sending to artist: ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending to artist ', error: error.message})
    }
  }
}
