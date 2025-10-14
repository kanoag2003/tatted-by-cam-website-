import sql from 'mysql2/promise';

export async function handler(event) {
  // parse the body, expecting the name of person
  const body = JSON.parse(event.body)
  const { name } = body;

}