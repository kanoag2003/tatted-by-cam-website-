import { handler } from './index.js';

const fakeEvent = {
  body: JSON.stringify({ name: 'Test Client' })
};

handler(fakeEvent).then(res => {
  console.log(res);
}).catch(err => console.error(err));