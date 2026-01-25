
async function testChat() {
  const queries = [
    "Tell me about Lotus Valley International School",
    "Which schools have a swimming pool?",
    "Do any schools have a hostel facility?",
    "Compare Lotus Valley and Orbit schools",
    "What are the fees for CBSE schools in Noida?"
  ];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      console.log('Response:', data.message);
      if (data.schools && data.schools.length > 0) {
        console.log('Mentioned Schools:', data.schools.map(s => s.name).join(', '));
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testChat();
