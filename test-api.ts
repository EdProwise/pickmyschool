
async function testFilter() {
  try {
    const response = await fetch('http://localhost:3000/api/schools?facilities=Library');
    const data = await response.json();
    console.log(`Found ${data.length} schools with Library facility`);
    if (data.length > 0) {
      console.log('Sample school:', data[0].name);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

await testFilter();
