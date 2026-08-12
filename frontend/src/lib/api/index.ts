import { apiFetch } from './client';
import {
  Administration,
  ApiResponse,
  DistrictManager,
  Driver,
  DriverRecommendation,
  DropOffLocation,
  FillingStation,
  NormalPerson,
  OTPResponse,
  PriorityCalculationResult,
  RequestItem,
  Vehicle,
} from '../types';

// --- AUTH API ---
export const authApi = {
  login: async (mail: string, password: string): Promise<ApiResponse<{ token: string; admin: Administration }>> => {
    return apiFetch<{ token: string; admin: Administration }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mail, password }),
    });
  },
};

// --- REQUESTS API ---
export const requestsApi = {
  getRequests: async (status?: string): Promise<ApiResponse<RequestItem[]>> => {
    const query = status ? `?status=${status}` : '';
    const res = await apiFetch<RequestItem[]>(`/requests${query}`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getRequestByID: async (id: string): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>(`/requests/${id}`);
  },

  createRequest: async (input: {
    requestType: string;
    requesterId: string;
    dropOffLocationId: string;
  }): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>('/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  calculatePriority: async (id: string): Promise<ApiResponse<PriorityCalculationResult>> => {
    return apiFetch<PriorityCalculationResult>(`/requests/${id}/calculate-priority`, {
      method: 'POST',
    });
  },

  assignRequest: async (
    id: string,
    input: { driverId: string; vehicleId: string; fillingStationId: string }
  ): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>(`/requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  dispatchRequest: async (id: string): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>(`/requests/${id}/dispatch`, {
      method: 'POST',
    });
  },

  generateOTP: async (id: string): Promise<ApiResponse<OTPResponse>> => {
    return apiFetch<OTPResponse>(`/requests/${id}/generate-otp`, {
      method: 'POST',
    });
  },

  completeRequest: async (id: string, otp: string): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>(`/requests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  cancelRequest: async (id: string): Promise<ApiResponse<RequestItem>> => {
    return apiFetch<RequestItem>(`/requests/${id}/cancel`, {
      method: 'POST',
    });
  },
};

// --- DRIVERS API ---
export const driversApi = {
  getDrivers: async (): Promise<ApiResponse<Driver[]>> => {
    const res = await apiFetch<Driver[]>('/drivers');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getDriverByID: async (id: string): Promise<ApiResponse<Driver>> => {
    return apiFetch<Driver>(`/drivers/${id}`);
  },

  getRecommendedDrivers: async (dropOffLocationId: string): Promise<ApiResponse<DriverRecommendation[]>> => {
    const res = await apiFetch<DriverRecommendation[]>(`/drivers/recommended?dropOffLocationId=${dropOffLocationId}`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getDriverRequests: async (id: string): Promise<ApiResponse<RequestItem[]>> => {
    const res = await apiFetch<RequestItem[]>(`/drivers/${id}/requests`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  createDriver: async (input: { name: string; contactNumber: string; phoneType: string }): Promise<ApiResponse<Driver>> => {
    return apiFetch<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

// --- VEHICLES API ---
export const vehiclesApi = {
  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const res = await apiFetch<Vehicle[]>('/vehicles');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getAvailableVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const res = await apiFetch<Vehicle[]>('/vehicles/available');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  createVehicle: async (input: { type: string; capacity: number }): Promise<ApiResponse<Vehicle>> => {
    return apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateVehicleStatus: async (id: string, status: string): Promise<ApiResponse<Vehicle>> => {
    return apiFetch<Vehicle>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// --- FILLING STATIONS API ---
export const fillingStationsApi = {
  getFillingStations: async (): Promise<ApiResponse<FillingStation[]>> => {
    const res = await apiFetch<FillingStation[]>('/filling-stations');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getRecommendedFillingStations: async (dropOffLocationId?: string): Promise<ApiResponse<FillingStation[]>> => {
    const query = dropOffLocationId ? `?dropOffLocationId=${dropOffLocationId}` : '';
    const res = await apiFetch<FillingStation[]>(`/filling-stations/recommended${query}`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  createFillingStation: async (input: { name: string; locationId: string }): Promise<ApiResponse<FillingStation>> => {
    return apiFetch<FillingStation>('/filling-stations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

// --- LOCATIONS API ---
export const locationsApi = {
  getDropOffLocations: async (): Promise<ApiResponse<DropOffLocation[]>> => {
    const res = await apiFetch<DropOffLocation[]>('/drop-off-locations');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getDropOffLocationByID: async (id: string): Promise<ApiResponse<DropOffLocation>> => {
    return apiFetch<DropOffLocation>(`/drop-off-locations/${id}`);
  },

  createDropOffLocation: async (input: {
    address: string;
    latitude: number;
    longitude: number;
    landmark?: string;
    hasPrivateBorewell: boolean;
    trafficRisk: string;
    normalTravelTime: number;
    isSchoolOrHospital: boolean;
  }): Promise<ApiResponse<DropOffLocation>> => {
    return apiFetch<DropOffLocation>('/drop-off-locations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getDriversForLocation: async (id: string): Promise<ApiResponse<DriverRecommendation[]>> => {
    const res = await apiFetch<DriverRecommendation[]>(`/drop-off-locations/${id}/drivers`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },
};

// --- PERSONS API ---
export const personsApi = {
  createPerson: async (input: { name: string; contactNumber: string; address?: string }): Promise<ApiResponse<NormalPerson>> => {
    return apiFetch<NormalPerson>('/persons', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

// --- DISTRICT MANAGERS API ---
export const districtManagersApi = {
  getDistrictManagers: async (): Promise<ApiResponse<DistrictManager[]>> => {
    const res = await apiFetch<DistrictManager[]>('/district-managers');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },

  getDistrictManagerRequests: async (id: string): Promise<ApiResponse<RequestItem[]>> => {
    const res = await apiFetch<RequestItem[]>(`/district-managers/${id}/requests`);
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },
};

// --- ADMINS API ---
export const adminsApi = {
  getAdmins: async (): Promise<ApiResponse<Administration[]>> => {
    const res = await apiFetch<Administration[]>('/admins');
    if (res.success && res.data) return res;
    return { success: true, data: [] };
  },
};
