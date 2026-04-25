export interface IndianState {
  name: string;
  slug: string;
}

export const INDIAN_STATES: IndianState[] = [
  { name: "Andhra Pradesh", slug: "andhra-pradesh" },
  { name: "Arunachal Pradesh", slug: "arunachal-pradesh" },
  { name: "Assam", slug: "assam" },
  { name: "Bihar", slug: "bihar" },
  { name: "Chhattisgarh", slug: "chhattisgarh" },
  { name: "Goa", slug: "goa" },
  { name: "Gujarat", slug: "gujarat" },
  { name: "Haryana", slug: "haryana" },
  { name: "Himachal Pradesh", slug: "himachal-pradesh" },
  { name: "Jharkhand", slug: "jharkhand" },
  { name: "Karnataka", slug: "karnataka" },
  { name: "Kerala", slug: "kerala" },
  { name: "Madhya Pradesh", slug: "madhya-pradesh" },
  { name: "Maharashtra", slug: "maharashtra" },
  { name: "Manipur", slug: "manipur" },
  { name: "Meghalaya", slug: "meghalaya" },
  { name: "Mizoram", slug: "mizoram" },
  { name: "Nagaland", slug: "nagaland" },
  { name: "Odisha", slug: "odisha" },
  { name: "Punjab", slug: "punjab" },
  { name: "Rajasthan", slug: "rajasthan" },
  { name: "Sikkim", slug: "sikkim" },
  { name: "Tamil Nadu", slug: "tamil-nadu" },
  { name: "Telangana", slug: "telangana" },
  { name: "Tripura", slug: "tripura" },
  { name: "Uttar Pradesh", slug: "uttar-pradesh" },
  { name: "Uttarakhand", slug: "uttarakhand" },
  { name: "West Bengal", slug: "west-bengal" },
  // Union Territories
  { name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands" },
  { name: "Chandigarh", slug: "chandigarh" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dadra-and-nagar-haveli-and-daman-and-diu" },
  { name: "Delhi", slug: "delhi" },
  { name: "Jammu and Kashmir", slug: "jammu-and-kashmir" },
  { name: "Ladakh", slug: "ladakh" },
  { name: "Lakshadweep", slug: "lakshadweep" },
  { name: "Puducherry", slug: "puducherry" },
];

export function getStateBySlug(slug: string): IndianState | undefined {
  return INDIAN_STATES.find(s => s.slug === slug);
}

export function getStateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
