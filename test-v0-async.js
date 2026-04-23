const { v0 } = require('v0-sdk');

async function test() {
  try {
    console.log('Sending v0 request async...');
    const result = await v0.chats.create({
      system: "You are a helpful UI engineer",
      message: "Create a simple button component with a label",
      responseMode: "async",
      modelConfiguration: {
        imageGenerations: false,
        thinking: false,
      },
    });
    console.log('Got result immediately:', JSON.stringify(result, null, 2));

    const poll = async () => {
      const res = await v0.chats.getById(result.id);
      console.log('Poll status:', res.latestVersion?.status);
      if (res.latestVersion?.status === 'completed' || res.latestVersion?.status === 'failed') {
        console.log('Final Demo URL:', res.latestVersion?.demoUrl);
        return;
      }
      setTimeout(poll, 3000);
    };
    poll();
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
