export enum TravelPreference {
  FOOD = 'food',
  CULTURE = 'culture',
  NATURE = 'nature',
  SHOPPING = 'shopping',
  ADVENTURE = 'adventure',
  RELAXATION = 'relaxation',
  ANIME = 'anime',
  HISTORY = 'history',
}

export enum AccommodationType {
  HOTEL = 'hotel',
  HOSTEL = 'hostel',
  APARTMENT = 'apartment',
  RESORT = 'resort',
}

export enum TransportationType {
  FLIGHT = 'flight',
  TRAIN = 'train',
  BUS = 'bus',
  CAR = 'car',
  TAXI = 'taxi',
  SUBWAY = 'subway',
  WALK = 'walk',
  BIKE = 'bike',
}

export interface Attraction {
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  duration: number
  estimated_cost: number
  tips?: string
}

export interface Restaurant {
  name: string
  cuisine_type: string
  address: string
  latitude: number
  longitude: number
  estimated_cost: number
  recommendations?: string
}

export interface Transportation {
  type: TransportationType
  from_location: string
  to_location: string
  departure_time?: string
  arrival_time?: string
  estimated_cost: number
  notes?: string
}

export interface Accommodation {
  name: string
  type: AccommodationType
  address: string
  latitude: number
  longitude: number
  check_in: string
  check_out: string
  estimated_cost: number
  facilities: string[]
}

export interface DailyItinerary {
  day: number
  date: string
  attractions: Attraction[]
  restaurants: Restaurant[]
  transportation: Transportation[]
  notes?: string
  total_cost: number
}

export interface TripPlan {
  id?: string
  user_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  total_days: number
  budget: number
  travelers: number
  preferences: TravelPreference[]
  has_children: boolean
  daily_itineraries: DailyItinerary[]
  accommodations: Accommodation[]
  estimated_costs: {
    transportation: number
    accommodation: number
    food: number
    attractions: number
    shopping: number
    other: number
  }
  total_estimated_cost: number
  created_at?: string
  updated_at?: string
}

export interface TripPlanRequest {
  destination: string
  start_date: string
  end_date: string
  budget: number
  travelers: number
  preferences: TravelPreference[]
  has_children: boolean
  additional_notes?: string
}

export interface Expense {
  id: string
  trip_id: string
  user_id: string
  category: string
  amount: number
  description: string
  date: string
  location?: string
  notes?: string
  created_at: string
}

export interface ExpenseCreate {
  trip_id: string
  category: string
  amount: number
  description: string
  date: string
  location?: string
  notes?: string
}

export interface ExpenseSummary {
  trip_id: string
  total_spent: number
  budget: number
  remaining: number
  by_category: Record<string, number>
  daily_average: number
}

export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

