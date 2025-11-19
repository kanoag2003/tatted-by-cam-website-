import 'dotenv/config'; 
import multipart from 'parse-multipart-data';

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

      const userName = parts.find(part => part.name === 'name');
      const age = parts.find(part => part.name === 'age');
      const photo = parts.find(part => part.name === 'photo');
      
      if (!userName || !age || !photo) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required fields" })
        };
      }

      const nameValue = userName.data.toString();
      const ageValue = age.data.toString();
      const photoData = photo.data;
      const photoFileName = photo.filename; 

      console.log(`User: ${nameValue}, Age: ${ageValue}, File: ${photoFileName}`);

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST, 
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_DATABASE 
      }); 
      await connection.end(); 
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Reference sent to artist'})
      }; 
    }

  } catch (error) {
    console.log('Error sending to artist: ', error)
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error sending to artist'})
    }
  }
};