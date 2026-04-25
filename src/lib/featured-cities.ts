// Curated list of featured cities for footer and sitemap SEO
// Add new cities here — they will automatically appear in both the footer and sitemap
export const FEATURED_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Surat", "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot",
  "Varanasi", "Amritsar", "Allahabad", "Ranchi", "Coimbatore", "Gwalior",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Noida",
  "Bhubaneswar", "Dehradun", "Kochi", "Mysore", "Gurgaon", "Jalandhar",
  "Vijayawada", "Visakhapatnam", "Aurangabad", "Dhanbad", "Navi Mumbai", "New Delhi", "Thane"
];

export function cityNameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
