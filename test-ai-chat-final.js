require('dotenv').config();

async function testChat() {
  const url = 'http://localhost:3000/api/chat';
  const payload = {
    message: 'What are the fees and results of Orbit school?',
  };

  try {
    console.log('Testing AI Chat API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ AI Chat is working correctly!');
    } else {
      console.log('\n❌ AI Chat failed with error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ Test failed with exception:', error.message);
  }
}

testChat();
