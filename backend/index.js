import mysql from 'mysql2/promise';
import 'dotenv/config'; 

export async function handler(event) {
  try{
    if (event.requestContext.http.method === 'OPTIONS'){
      return {
        statusCode: 200
      }
    }

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST, 
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_DATABASE 
    }); 
    if (event.requestContext.http.method === 'POST'){
      // parse the body created from form, expecting the name of person
      const { name, email, formattedDate } = JSON.parse(event.body);
      await connection.execute(
        'INSERT INTO clients (name, email, formattedDate) VALUES (?, ?, ?)', 
        [name, email, formattedDate]
      );
  
      await connection.end();
  
      return{
        statusCode: 200,
        body: JSON.stringify({ message: 'Client added '})
      }
    }
    if (event.requestContext.http.method === 'GET'){
      const [rows] = await connection.execute(
        'SELECT formattedDate from clients'
      );
      await connection.end();
      return {
        statusCode: 200, 
        body: JSON.stringify(rows)
      }
    }
  } catch (error){
    console.error('Full error is: ', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding client details '})
    }
  }
}