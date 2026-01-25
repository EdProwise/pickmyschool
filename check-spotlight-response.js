async function checkSpotlight() {
  try {
    const response = await fetch('http://localhost:3000/api/schools/spotlight');
    const data = await response.json();
    
    console.log('=== SPOTLIGHT API RESPONSE ===\n');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.school) {
      console.log('\n=== KEY FIELDS ===');
      console.log(`ID: ${data.school.id}`);
      console.log(`Name: ${data.school.name}`);
      console.log(`Fees Min: ${data.school.feesMin}`);
      console.log(`Fees Max: ${data.school.feesMax}`);
      console.log(`Rating: ${data.school.rating}`);
      console.log(`Review Count: ${data.school.reviewCount}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSpotlight();
