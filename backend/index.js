import mysql from 'mysql2/promise';
import 'dotenv/config'; 

export async function handler(event) {
     // parse the body created from form, expecting the name of person
  const { name, email } = JSON.parse(event.body);
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

    await connection.execute(
      'INSERT INTO clients (name, email) VALUES (?, ?)',
      [name, email]
    );

    await connection.end();

    return{
      statusCode: 200,
      body: JSON.stringify({ message: 'Client added '})
    }
  } catch (error){
    console.error("Full error is: ", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding client '})
    }
  }
}