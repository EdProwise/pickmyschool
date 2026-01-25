
import { getAllSchools } from './src/db/schoolsHelper';
import dotenv from 'dotenv';
dotenv.config();

async function verifyFix() {
  const results = await getAllSchools({
    isPublic: true,
    limit: 50
  });

  const facilitiesParam = 'Library';
  const requestedFacilities = facilitiesParam.split(',').map(f => f.trim().toLowerCase());
  
  const filteredResults = results.filter(school => {
    const arrayFacilities = Array.isArray(school.facilities) 
      ? (school.facilities as string[]).map(f => f.toLowerCase()) 
      : [];

    return requestedFacilities.every(rf => {
      if (arrayFacilities.some(sf => sf.includes(rf))) return true;
      if (rf === 'library' && school.hasLibrary) return true;
      if (rf === 'computer lab' && school.hasComputerLab) return true;
      return false;
    });
  });

  console.log(`Total schools: ${results.length}`);
  console.log(`Schools with Library: ${filteredResults.length}`);
  if (filteredResults.length > 0) {
    console.log('Match found:', filteredResults[0].name);
  }
}

verifyFix();
