async function testSpotlight() {
  try {
    const response = await fetch('http://localhost:3000/api/schools/spotlight');
    const data = await response.json();
    console.log('Spotlight API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSpotlight();
