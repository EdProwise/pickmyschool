// Test that signup endpoint is now protected
async function testSignup() {
  console.log('Testing signup without auth token...');
  const res1 = await fetch('http://localhost:3000/api/admin/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'attacker@test.com', password: 'Test12345', name: 'Attacker' })
  });
  const data1 = await res1.json();
  console.log('Response:', res1.status, data1);
  console.log('Protected:', res1.status === 401 ? 'YES' : 'NO');
}

async function testLogin() {
  console.log('\nTesting login with non-existent user...');
  const res2 = await fetch('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@test.com', password: 'wrongpassword' })
  });
  const data2 = await res2.json();
  console.log('Response:', res2.status, data2);
  console.log('Does NOT auto-create admin:', data2.code === 'INVALID_CREDENTIALS' ? 'YES' : 'NO');
}

testSignup().then(testLogin).catch(console.error);
