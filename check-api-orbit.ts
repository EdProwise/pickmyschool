async function checkApi() {
  try {
    const response = await fetch('http://localhost:3000/api/schools?limit=1&search=Orbit');
    const data = await response.json();
    console.log(JSON.stringify(data[0], null, 2));
  } catch (error) {
    console.error('Error fetching API:', error);
  }
}

checkApi();
