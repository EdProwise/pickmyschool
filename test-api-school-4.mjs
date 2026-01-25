const response = await fetch('http://localhost:3000/api/schools?id=4');
const school = await response.json();

console.log('School ID 4 API Response:');
console.log('==========================');
console.log('Website:', school.website || 'NOT IN API');
console.log('Facebook:', school.facebookUrl || 'NOT IN API');
console.log('Instagram:', school.instagramUrl || 'NOT IN API');
console.log('LinkedIn:', school.linkedinUrl || 'NOT IN API');
console.log('YouTube:', school.youtubeUrl || 'NOT IN API');
console.log('WhatsApp:', school.whatsappNumber || 'NOT IN API');
