import { api } from './client';

export interface StateItem {
  uuid: string;
  countryUuid?: string;
  name: string;
  isActive: boolean;
}

export interface DistrictItem {
  uuid: string;
  stateUuid?: string;
  name: string;
  isActive: boolean;
}

export interface CityItem {
  uuid: string;
  districtUuid?: string;
  name: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

export const LocationService = {
  getAllStates: () =>
    api.get<ApiResponse<StateItem[]>>('/api/identity/locations/states/get-all'),

  getDistrictsByStateUuid: (stateUuid: string) =>
    api.get<ApiResponse<DistrictItem[]>>(`/api/identity/locations/districts/by-state/${stateUuid}`),

  getDistrictsByStateName: (stateName: string) =>
    api.get<ApiResponse<DistrictItem[]>>(`/api/identity/locations/districts/by-state-name/${encodeURIComponent(stateName)}`),

  getCitiesByDistrictUuid: (districtUuid: string) =>
    api.get<ApiResponse<CityItem[]>>(`/api/identity/locations/cities/by-district/${districtUuid}`),

  getCitiesByDistrictName: (districtName: string) =>
    api.get<ApiResponse<CityItem[]>>(`/api/identity/locations/cities/by-district-name/${encodeURIComponent(districtName)}`),
};

export const FALLBACK_INDIAN_STATES: string[] = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Telangana',
  'Andhra Pradesh',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
  'Goa',
  'Assam',
  'Chhattisgarh',
  'Himachal Pradesh',
  'Jharkhand',
  'Uttarakhand'
];

export const FALLBACK_STATE_DISTRICTS: Record<string, string[]> = {
  Kerala: [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Erode', 'Vellore', 'Kanyakumari', 'Thanjavur'
  ],
  Karnataka: [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru (Dakshina Kannada)',
    'Hubballi-Dharwad', 'Belagavi', 'Udupi', 'Shimoga', 'Tumakuru'
  ],
  Maharashtra: [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane',
    'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur'
  ],
  Delhi: [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
    'South Delhi', 'West Delhi'
  ],
  Telangana: [
    'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Nellore'
  ],
  Gujarat: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'
  ],
  Rajasthan: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Noida (Gautam Buddha Nagar)', 'Kanpur', 'Varanasi', 'Agra', 'Ghaziabad'
  ]
};
