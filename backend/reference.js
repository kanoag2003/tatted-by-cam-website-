import 'dotenv/config'; 
import multipart from 'parse-multipart-data';

export async function handler (event) {

  try{
    if (event.requestContext.http.method === 'OPTIONS'){
      return {
        statusCode: 200
      }
    }

    
  } catch {

  }
};