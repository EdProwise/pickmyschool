async function test() {
  const res = await fetch('http://localhost:3000/api/schools/spotlight');
  const data = await res.json();
  
  console.log('Spotlight School Data:');
  console.log('---');
  console.log('ID:', data.school?.id);
  console.log('Name:', data.school?.name);
  console.log('City:', data.school?.city);
  console.log('Fees Min:', data.school?.feesMin);
  console.log('Fees Max:', data.school?.feesMax);
  console.log('Rating:', data.school?.rating);
  console.log('Review Count:', data.school?.reviewCount);
  console.log('Featured:', data.school?.featured);
  console.log('---');
  console.log('\nFull Object:');
  console.log(JSON.stringify(data.school, null, 2));
}

test();
