export type RequestStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequestType = 'Letter' | 'Call' | 'Online' | 'Offline';
export type DriverStatus = 'Available' | 'On Delivery' | 'Inactive';
export type PhoneType = 'Basic' | 'Smart';
export type VehicleStatus = 'Available' | 'On Delivery' | 'Maintenance';
export type VehicleType = 'Contracted' | 'Municipal';
export type TrafficRisk = 'Low' | 'Medium' | 'High';
export type StationAvailability = 'AVAILABLE' | 'BUSY' | 'VERY_BUSY';
export type UserRole = 'Admin' | 'Manager' | 'Dispatcher' | 'Driver' | 'DistrictManager';

export interface Location {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  createdAt: string;
}

export interface DropOffLocation {
  id: string;
  hasPrivateBorewell: boolean;
  trafficRisk: TrafficRisk;
  normalTravelTime: number;
  isSchoolOrHospital: boolean;
  createdAt: string;
  location?: Location;
}

export interface NormalPerson {
  id: string;
  name: string;
  contactNumber: string;
  address?: string;
  locationId?: string;
  createdAt: string;
  location?: Location;
}

export interface DistrictManager {
  id: string;
  name: string;
  contactNumber: string;
  normalPersonId: string;
  locationId?: string;
  createdAt: string;
  normalPerson?: NormalPerson;
  location?: Location;
}

export interface Administration {
  id: string;
  name: string;
  mail: string;
  contactNumber?: string;
  role: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  contactNumber: string;
  phoneType: PhoneType;
  totalRating: number;
  totalDeliveries: number;
  status: DriverStatus;
  createdAt: string;
}

export interface DriverRecommendation {
  driver: Driver;
  locationDeliveryCount: number;
  recommendationReason: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  capacity: number;
  currentLocationId?: string;
  status: VehicleStatus;
  assignedDriverId?: string;
  createdAt: string;
  currentLocation?: Location;
  assignedDriver?: Driver;
}

export interface FillingStation {
  id: string;
  name: string;
  locationId: string;
  currentTruckCount: number;
  availability: StationAvailability;
  createdAt: string;
  location?: Location;
}

export interface RequestItem {
  id: string;
  requestType: RequestType;
  requesterId: string;
  dropOffLocationId: string;
  fillingStationId?: string;
  driverId?: string;
  vehicleId?: string;
  status: RequestStatus;
  priorityScore: number;
  otpExpiresAt?: string;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  requester?: NormalPerson;
  dropOffLocation?: DropOffLocation;
  fillingStation?: FillingStation;
  driver?: Driver;
  vehicle?: Vehicle;
}

export interface PriorityCalculationResult {
  requestId: string;
  priorityScore: number;
  breakdown: Record<string, number>;
  explanation: string[];
}

export interface OTPResponse {
  requestId: string;
  otp: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
