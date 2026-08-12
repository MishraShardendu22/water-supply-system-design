import { apiFetch } from './client';
import {
  mockAdmins,
  mockDistrictManagers,
  mockDriverRecommendations,
  mockDrivers,
  mockDropOffLocations,
  mockFillingStations,
  mockPersons,
  mockRequests,
  mockVehicles,
} from './mockData';
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

let localRequests = [...mockRequests];
let localDrivers = [...mockDrivers];
let localVehicles = [...mockVehicles];
let localFillingStations = [...mockFillingStations];
let localDropOffLocations = [...mockDropOffLocations];
let localPersons = [...mockPersons];
let localManagers = [...mockDistrictManagers];
let localAdmins = [...mockAdmins];

// --- AUTH API ---
export const authApi = {
  login: async (mail: string, password: string) => {
    const res = await apiFetch<{ token: string; admin: Administration }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mail, password }),
    });

    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.admin.role || 'Admin');
        localStorage.setItem('user_name', res.data.admin.name);
      }
      return res;
    }

    // Mock Fallback
    if (mail === 'admin@water.gov' && password === 'AdminPassword123!') {
      const mockRes = {
        token: 'mock-jwt-token-12345',
        admin: localAdmins[0],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', mockRes.token);
        localStorage.setItem('user_role', 'Admin');
        localStorage.setItem('user_name', mockRes.admin.name);
      }
      return { success: true, data: mockRes };
    }

    return {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    };
  },
};

// --- REQUESTS API ---
export const requestsApi = {
  getRequests: async (status?: string): Promise<ApiResponse<RequestItem[]>> => {
    const query = status ? `?status=${status}` : '';
    const res = await apiFetch<RequestItem[]>(`/requests${query}`);
    if (res.success && res.data) return res;
    
    let list = localRequests;
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return { success: true, data: list };
  },

  getRequestByID: async (id: string): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>(`/requests/${id}`);
    if (res.success && res.data) return res;

    const found = localRequests.find((r) => r.id === id);
    if (found) return { success: true, data: found };
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },

  createRequest: async (input: {
    requestType: string;
    requesterId: string;
    dropOffLocationId: string;
  }): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>('/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localRequests.unshift(res.data);
      return res;
    }

    const requester = localPersons.find((p) => p.id === input.requesterId) || localPersons[0];
    const dropOff = localDropOffLocations.find((d) => d.id === input.dropOffLocationId) || localDropOffLocations[0];

    const newReq: RequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      requestType: input.requestType as any,
      requesterId: input.requesterId,
      dropOffLocationId: input.dropOffLocationId,
      status: 'PENDING',
      priorityScore: dropOff.isSchoolOrHospital ? 80.0 : 50.0,
      createdAt: new Date().toISOString(),
      requester,
      dropOffLocation: dropOff,
    };
    localRequests.unshift(newReq);
    return { success: true, data: newReq };
  },

  calculatePriority: async (id: string): Promise<ApiResponse<PriorityCalculationResult>> => {
    const res = await apiFetch<PriorityCalculationResult>(`/requests/${id}/calculate-priority`, {
      method: 'POST',
    });
    if (res.success && res.data) return res;

    const req = localRequests.find((r) => r.id === id);
    if (req) {
      req.status = req.status === 'PENDING' ? 'VERIFIED' : req.status;
      const score = req.dropOffLocation?.isSchoolOrHospital ? 80.0 : 50.0;
      req.priorityScore = score;
      return {
        success: true,
        data: {
          requestId: id,
          priorityScore: score,
          breakdown: {
            base_score: 50,
            school_hospital_bonus: req.dropOffLocation?.isSchoolOrHospital ? 30 : 0,
          },
          explanation: [
            'Base request priority: +50.0',
            req.dropOffLocation?.isSchoolOrHospital ? 'Public institution (School/Hospital): +30.0' : 'Standard location',
          ],
        },
      };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },

  assignRequest: async (
    id: string,
    input: { driverId: string; vehicleId: string; fillingStationId: string }
  ): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>(`/requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) return res;

    const req = localRequests.find((r) => r.id === id);
    if (req) {
      req.status = 'ASSIGNED';
      req.driverId = input.driverId;
      req.vehicleId = input.vehicleId;
      req.fillingStationId = input.fillingStationId;
      req.driver = localDrivers.find((d) => d.id === input.driverId);
      req.vehicle = localVehicles.find((v) => v.id === input.vehicleId);
      req.fillingStation = localFillingStations.find((f) => f.id === input.fillingStationId);
      return { success: true, data: req };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },

  dispatchRequest: async (id: string): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>(`/requests/${id}/dispatch`, {
      method: 'POST',
    });
    if (res.success && res.data) return res;

    const req = localRequests.find((r) => r.id === id);
    if (req) {
      req.status = 'DISPATCHED';
      req.dispatchedAt = new Date().toISOString();
      return { success: true, data: req };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },

  generateOTP: async (id: string): Promise<ApiResponse<OTPResponse>> => {
    const res = await apiFetch<OTPResponse>(`/requests/${id}/generate-otp`, {
      method: 'POST',
    });
    if (res.success && res.data) return res;

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      success: true,
      data: {
        requestId: id,
        otp: otpCode,
        expiresAt,
      },
    };
  },

  completeRequest: async (id: string, otp: string): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>(`/requests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
    if (res.success && res.data) return res;

    const req = localRequests.find((r) => r.id === id);
    if (req) {
      req.status = 'COMPLETED';
      req.completedAt = new Date().toISOString();
      return { success: true, data: req };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },

  cancelRequest: async (id: string): Promise<ApiResponse<RequestItem>> => {
    const res = await apiFetch<RequestItem>(`/requests/${id}/cancel`, {
      method: 'POST',
    });
    if (res.success && res.data) return res;

    const req = localRequests.find((r) => r.id === id);
    if (req) {
      req.status = 'CANCELLED';
      return { success: true, data: req };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } };
  },
};

// --- DRIVERS API ---
export const driversApi = {
  getDrivers: async (): Promise<ApiResponse<Driver[]>> => {
    const res = await apiFetch<Driver[]>('/drivers');
    if (res.success && res.data) return res;
    return { success: true, data: localDrivers };
  },

  getDriverByID: async (id: string): Promise<ApiResponse<Driver>> => {
    const res = await apiFetch<Driver>(`/drivers/${id}`);
    if (res.success && res.data) return res;
    const found = localDrivers.find((d) => d.id === id);
    if (found) return { success: true, data: found };
    return { success: false, error: { code: 'NOT_FOUND', message: 'Driver not found' } };
  },

  getRecommendedDrivers: async (dropOffLocationId: string): Promise<ApiResponse<DriverRecommendation[]>> => {
    const res = await apiFetch<DriverRecommendation[]>(`/drivers/recommended?dropOffLocationId=${dropOffLocationId}`);
    if (res.success && res.data) return res;
    return { success: true, data: mockDriverRecommendations };
  },

  getDriverRequests: async (id: string): Promise<ApiResponse<RequestItem[]>> => {
    const res = await apiFetch<RequestItem[]>(`/drivers/${id}/requests`);
    if (res.success && res.data) return res;
    const list = localRequests.filter((r) => r.driverId === id);
    return { success: true, data: list };
  },

  createDriver: async (input: { name: string; contactNumber: string; phoneType: string }): Promise<ApiResponse<Driver>> => {
    const res = await apiFetch<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localDrivers.unshift(res.data);
      return res;
    }

    const newDriver: Driver = {
      id: `driver-${Date.now().toString().slice(-4)}`,
      name: input.name,
      contactNumber: input.contactNumber,
      phoneType: input.phoneType as any,
      totalRating: 5.0,
      totalDeliveries: 0,
      status: 'Available',
      createdAt: new Date().toISOString(),
    };
    localDrivers.unshift(newDriver);
    return { success: true, data: newDriver };
  },
};

// --- VEHICLES API ---
export const vehiclesApi = {
  getVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const res = await apiFetch<Vehicle[]>('/vehicles');
    if (res.success && res.data) return res;
    return { success: true, data: localVehicles };
  },

  getAvailableVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const res = await apiFetch<Vehicle[]>('/vehicles/available');
    if (res.success && res.data) return res;
    const list = localVehicles.filter((v) => v.status === 'Available');
    return { success: true, data: list };
  },

  createVehicle: async (input: { type: string; capacity: number }): Promise<ApiResponse<Vehicle>> => {
    const res = await apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localVehicles.unshift(res.data);
      return res;
    }

    const newVehicle: Vehicle = {
      id: `veh-${Date.now().toString().slice(-4)}`,
      type: input.type as any,
      capacity: input.capacity,
      status: 'Available',
      createdAt: new Date().toISOString(),
    };
    localVehicles.unshift(newVehicle);
    return { success: true, data: newVehicle };
  },

  updateVehicleStatus: async (id: string, status: string): Promise<ApiResponse<Vehicle>> => {
    const res = await apiFetch<Vehicle>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success && res.data) return res;

    const v = localVehicles.find((item) => item.id === id);
    if (v) {
      v.status = status as any;
      return { success: true, data: v };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Vehicle not found' } };
  },
};

// --- FILLING STATIONS API ---
export const fillingStationsApi = {
  getFillingStations: async (): Promise<ApiResponse<FillingStation[]>> => {
    const res = await apiFetch<FillingStation[]>('/filling-stations');
    if (res.success && res.data) return res;
    return { success: true, data: localFillingStations };
  },

  getRecommendedFillingStations: async (dropOffLocationId?: string): Promise<ApiResponse<FillingStation[]>> => {
    const query = dropOffLocationId ? `?dropOffLocationId=${dropOffLocationId}` : '';
    const res = await apiFetch<FillingStation[]>(`/filling-stations/recommended${query}`);
    if (res.success && res.data) return res;
    return { success: true, data: localFillingStations };
  },

  createFillingStation: async (input: { name: string; locationId: string }): Promise<ApiResponse<FillingStation>> => {
    const res = await apiFetch<FillingStation>('/filling-stations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localFillingStations.unshift(res.data);
      return res;
    }

    const newStation: FillingStation = {
      id: `fs-${Date.now().toString().slice(-4)}`,
      name: input.name,
      locationId: input.locationId,
      currentTruckCount: 0,
      availability: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };
    localFillingStations.unshift(newStation);
    return { success: true, data: newStation };
  },
};

// --- LOCATIONS API ---
export const locationsApi = {
  getDropOffLocations: async (): Promise<ApiResponse<DropOffLocation[]>> => {
    const res = await apiFetch<DropOffLocation[]>('/drop-off-locations');
    if (res.success && res.data) return res;
    return { success: true, data: localDropOffLocations };
  },

  getDropOffLocationByID: async (id: string): Promise<ApiResponse<DropOffLocation>> => {
    const res = await apiFetch<DropOffLocation>(`/drop-off-locations/${id}`);
    if (res.success && res.data) return res;
    const found = localDropOffLocations.find((l) => l.id === id);
    if (found) return { success: true, data: found };
    return { success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } };
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
    const res = await apiFetch<DropOffLocation>('/drop-off-locations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localDropOffLocations.unshift(res.data);
      return res;
    }

    const id = `loc-${Date.now().toString().slice(-4)}`;
    const newLoc: DropOffLocation = {
      id,
      hasPrivateBorewell: input.hasPrivateBorewell,
      trafficRisk: input.trafficRisk as any,
      normalTravelTime: input.normalTravelTime,
      isSchoolOrHospital: input.isSchoolOrHospital,
      createdAt: new Date().toISOString(),
      location: {
        id,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        landmark: input.landmark,
        createdAt: new Date().toISOString(),
      },
    };
    localDropOffLocations.unshift(newLoc);
    return { success: true, data: newLoc };
  },

  getDriversForLocation: async (id: string): Promise<ApiResponse<DriverRecommendation[]>> => {
    const res = await apiFetch<DriverRecommendation[]>(`/drop-off-locations/${id}/drivers`);
    if (res.success && res.data) return res;
    return { success: true, data: mockDriverRecommendations };
  },
};

// --- PERSONS API ---
export const personsApi = {
  createPerson: async (input: { name: string; contactNumber: string; address?: string }): Promise<ApiResponse<NormalPerson>> => {
    const res = await apiFetch<NormalPerson>('/persons', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (res.success && res.data) {
      localPersons.unshift(res.data);
      return res;
    }

    const newPerson: NormalPerson = {
      id: `person-${Date.now().toString().slice(-4)}`,
      name: input.name,
      contactNumber: input.contactNumber,
      address: input.address,
      createdAt: new Date().toISOString(),
    };
    localPersons.unshift(newPerson);
    return { success: true, data: newPerson };
  },
};

// --- DISTRICT MANAGERS API ---
export const districtManagersApi = {
  getDistrictManagers: async (): Promise<ApiResponse<DistrictManager[]>> => {
    const res = await apiFetch<DistrictManager[]>('/district-managers');
    if (res.success && res.data) return res;
    return { success: true, data: localManagers };
  },

  getDistrictManagerRequests: async (id: string): Promise<ApiResponse<RequestItem[]>> => {
    const res = await apiFetch<RequestItem[]>(`/district-managers/${id}/requests`);
    if (res.success && res.data) return res;
    return { success: true, data: localRequests };
  },
};

// --- ADMINS API ---
export const adminsApi = {
  getAdmins: async (): Promise<ApiResponse<Administration[]>> => {
    const res = await apiFetch<Administration[]>('/admins');
    if (res.success && res.data) return res;
    return { success: true, data: localAdmins };
  },
};
