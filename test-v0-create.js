process.env.V0_API_KEY = "";
const { v0 } = require('v0-sdk');

async function test() {
  try {
    console.log('Sending v0 request async...');
    const result = await v0.chats.create({
      system: "You are a helpful UI engineer",
      message: "Create a simple button component with a label",
      responseMode: "async",
    });
    console.log('Got result immediately:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
