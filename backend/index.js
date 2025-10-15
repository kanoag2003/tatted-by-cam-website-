import sql from 'mysql2/promise';

export async function handler(event) {
  // parse the body, expecting the name of person
  const body = JSON.parse(event.body)
  const { name } = body;

  
  const connection = await sql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_DATABASE 
  });

  
}