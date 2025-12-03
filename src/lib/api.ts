// API utility functions for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface School {
  id: number;
  name: string;
  logo: string | null;
  bannerImage: string | null;
  address: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  board: string;
  medium: string | null;
  classesOffered: string | null;
  establishmentYear: number | null;
  studentTeacherRatio: string | null;
  schoolType: string | null;
  feesMin: number | null;
  feesMax: number | null;
  facilities: string[] | null;
  description: string | null;
  gallery: string[] | null;
  contactEmail: string | null;
  contactPhone: string | null;
  rating: number;
  reviewCount: number;
  profileViews: number;
  featured: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  role: 'student' | 'school';
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  class: string | null;
  schoolId: number | null;
  savedSchools: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: number;
  studentId: number;
  schoolId: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentClass: string;
  message: string | null;
  status: 'New' | 'In Progress' | 'Converted' | 'Closed';
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestedSchools?: number[];
}

export interface Chat {
  id: number;
  userId: number;
  role: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

// Schools API
export const getSchools = async (params?: {
  city?: string;
  board?: string;
  feesMin?: number;
  feesMax?: number;
  schoolType?: string;
  facilities?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}): Promise<School[]> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/schools?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch schools');
  return response.json();
};

export const getSchoolById = async (id: number): Promise<School> => {
  const response = await fetch(`${API_BASE_URL}/api/schools?id=${id}`);
  if (!response.ok) throw new Error('Failed to fetch school');
  return response.json();
};

export const getSchoolsByIds = async (ids: number[]): Promise<School[]> => {
  if (ids.length === 0) {
    return [];
  }
  
  if (ids.length > 10) {
    throw new Error('Maximum 10 schools can be fetched at once');
  }
  
  const response = await fetch(`${API_BASE_URL}/api/schools?ids=${ids.join(',')}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch schools');
  }
  return response.json();
};

export const getFeaturedSchools = async (limit = 10): Promise<School[]> => {
  const response = await fetch(`${API_BASE_URL}/api/schools/featured?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch featured schools');
  return response.json();
};

// Auth API
export const signup = async (data: {
  role: 'student' | 'school';
  email: string;
  password: string;
  name: string;
  phone?: string;
  city?: string;
  class?: string;
  schoolId?: number;
}): Promise<{ user: User; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  return response.json();
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
};

export const getMe = async (token: string): Promise<{ user: User }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

// Enquiries API
export const submitEnquiry = async (
  token: string,
  data: {
    schoolId: number;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    studentClass: string;
    message?: string;
  }
): Promise<{ enquiry: Enquiry; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit enquiry');
  }
  return response.json();
};

export const getMyEnquiries = async (token: string): Promise<Enquiry[]> => {
  const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch enquiries');
  return response.json();
};

// Chat API
export const sendChatMessage = async (
  token: string,
  message: string
): Promise<{ response: string; schools: School[]; chatId: number }> => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return response.json();
};

export const getChatHistory = async (token: string): Promise<{ chat: Chat | null }> => {
  const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return response.json();
};