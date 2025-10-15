import mysql from 'mysql2/promise';
import 'dotenv/config'; 

export async function handler(event) {
  try{
     // parse the body created from form, expecting the name of person
  const { name } = JSON.parse(event.body);

  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST, 
    port: 3306, // change later 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_DATABASE 
  }); 

  // set what sql should be looking for in result 
  await connection.execute(
      'INSERT INTO clients (name) VALUES (?)',
      [name]
  );
  await connection.end();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Client added! '}),

  }
  } catch (error){
    console.error("Full error is: ", error)
      }
}