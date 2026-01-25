async function checkSchool4() {
  try {
    const response = await fetch('http://localhost:3000/api/schools?id=4');
    const school = await response.json();
    
    console.log('School ID 4 (Lotus School) Contact Info:');
    console.log('========================================');
    console.log('Website:', school.website || 'NOT SET');
    console.log('Facebook:', school.facebookUrl || 'NOT SET');
    console.log('Instagram:', school.instagramUrl || 'NOT SET');
    console.log('LinkedIn:', school.linkedinUrl || 'NOT SET');
    console.log('YouTube:', school.youtubeUrl || 'NOT SET');
    console.log('\nContact Details:');
    console.log('Phone:', school.contactPhone || school.contactNumber || 'NOT SET');
    console.log('Email:', school.contactEmail || school.email || 'NOT SET');
    console.log('WhatsApp:', school.whatsappNumber || 'NOT SET');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchool4();
