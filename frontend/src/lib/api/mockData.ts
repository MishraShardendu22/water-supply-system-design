import {
  Administration,
  DistrictManager,
  Driver,
  DriverRecommendation,
  DropOffLocation,
  FillingStation,
  NormalPerson,
  RequestItem,
  Vehicle,
} from '../types';

export const mockAdmins: Administration[] = [
  {
    id: 'admin-1',
    name: 'System Admin',
    mail: 'admin@water.gov',
    role: 'Admin',
    contactNumber: '+919876500001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-2',
    name: 'Meera Rao',
    mail: 'meera.rao@water.gov',
    role: 'Dispatcher',
    contactNumber: '+919876500002',
    createdAt: new Date().toISOString(),
  },
];

export const mockDropOffLocations: DropOffLocation[] = [
  {
    id: 'loc-hospital-1',
    hasPrivateBorewell: false,
    trafficRisk: 'Low',
    normalTravelTime: 15,
    isSchoolOrHospital: true,
    createdAt: new Date().toISOString(),
    location: {
      id: 'loc-hospital-1',
      address: 'District Civil Hospital, Sector 4',
      latitude: 28.6139,
      longitude: 77.209,
      landmark: 'Near Main Emergency Gate 2',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'loc-school-2',
    hasPrivateBorewell: false,
    trafficRisk: 'Medium',
    normalTravelTime: 25,
    isSchoolOrHospital: true,
    createdAt: new Date().toISOString(),
    location: {
      id: 'loc-school-2',
      address: 'Government High School, Ward 12',
      latitude: 28.621,
      longitude: 77.215,
      landmark: 'Opposite Community Water Tank',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'loc-settlement-3',
    hasPrivateBorewell: true,
    trafficRisk: 'High',
    normalTravelTime: 35,
    isSchoolOrHospital: false,
    createdAt: new Date().toISOString(),
    location: {
      id: 'loc-settlement-3',
      address: 'Informal Settlement Cluster B, Ambedkar Nagar',
      latitude: 28.605,
      longitude: 77.198,
      landmark: 'Behind Overhead Railway Bridge',
      createdAt: new Date().toISOString(),
    },
  },
];

export const mockPersons: NormalPerson[] = [
  {
    id: 'person-1',
    name: 'Dr. Ramesh Sharma',
    contactNumber: '+919876543210',
    address: 'Civil Hospital Staff Quarters',
    locationId: 'loc-hospital-1',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[0].location,
  },
  {
    id: 'person-2',
    name: 'Sunita Verma (Principal)',
    contactNumber: '+919876543211',
    address: 'Govt High School Office',
    locationId: 'loc-school-2',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[1].location,
  },
  {
    id: 'person-3',
    name: 'Rajesh Kumar (Resident Rep)',
    contactNumber: '+919876543212',
    address: 'Ambedkar Nagar Block 4',
    locationId: 'loc-settlement-3',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[2].location,
  },
];

export const mockDistrictManagers: DistrictManager[] = [
  {
    id: 'dm-1',
    name: 'Vikram Singh',
    contactNumber: '+919811122233',
    normalPersonId: 'person-3',
    locationId: 'loc-settlement-3',
    createdAt: new Date().toISOString(),
    normalPerson: mockPersons[2],
    location: mockDropOffLocations[2].location,
  },
];

export const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Suresh Yadav',
    contactNumber: '+919123456789',
    phoneType: 'Basic',
    totalRating: 4.8,
    totalDeliveries: 42,
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'driver-2',
    name: 'Ramesh Pal',
    contactNumber: '+919123456790',
    phoneType: 'Smart',
    totalRating: 4.6,
    totalDeliveries: 28,
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'driver-3',
    name: 'Anil Kumar',
    contactNumber: '+919123456791',
    phoneType: 'Basic',
    totalRating: 4.9,
    totalDeliveries: 65,
    status: 'On Delivery',
    createdAt: new Date().toISOString(),
  },
];

export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    type: 'Municipal',
    capacity: 10000,
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'veh-2',
    type: 'Contracted',
    capacity: 8000,
    status: 'Available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'veh-3',
    type: 'Municipal',
    capacity: 12000,
    status: 'On Delivery',
    assignedDriverId: 'driver-3',
    createdAt: new Date().toISOString(),
  },
];

export const mockFillingStations: FillingStation[] = [
  {
    id: 'fs-1',
    name: 'Central Hydrant Station 1 (North)',
    locationId: 'loc-hospital-1',
    currentTruckCount: 1,
    availability: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[0].location,
  },
  {
    id: 'fs-2',
    name: 'Municipal Reservoir Station 2 (East)',
    locationId: 'loc-school-2',
    currentTruckCount: 4,
    availability: 'BUSY',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[1].location,
  },
  {
    id: 'fs-3',
    name: 'Industrial Borewell Station 3 (South)',
    locationId: 'loc-settlement-3',
    currentTruckCount: 7,
    availability: 'VERY_BUSY',
    createdAt: new Date().toISOString(),
    location: mockDropOffLocations[2].location,
  },
];

export const mockRequests: RequestItem[] = [
  {
    id: 'req-101',
    requestType: 'Online',
    requesterId: 'person-1',
    dropOffLocationId: 'loc-hospital-1',
    status: 'PENDING',
    priorityScore: 80.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    requester: mockPersons[0],
    dropOffLocation: mockDropOffLocations[0],
  },
  {
    id: 'req-102',
    requestType: 'Call',
    requesterId: 'person-2',
    dropOffLocationId: 'loc-school-2',
    status: 'VERIFIED',
    priorityScore: 80.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    requester: mockPersons[1],
    dropOffLocation: mockDropOffLocations[1],
  },
  {
    id: 'req-103',
    requestType: 'Letter',
    requesterId: 'person-3',
    dropOffLocationId: 'loc-settlement-3',
    fillingStationId: 'fs-1',
    driverId: 'driver-3',
    vehicleId: 'veh-3',
    status: 'DISPATCHED',
    priorityScore: 35.0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    dispatchedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    requester: mockPersons[2],
    dropOffLocation: mockDropOffLocations[2],
    fillingStation: mockFillingStations[0],
    driver: mockDrivers[2],
    vehicle: mockVehicles[2],
  },
];

export const mockDriverRecommendations: DriverRecommendation[] = [
  {
    driver: mockDrivers[0],
    locationDeliveryCount: 14,
    recommendationReason: 'Delivered 14 time(s) to this drop-off location before (familiar route)',
  },
  {
    driver: mockDrivers[1],
    locationDeliveryCount: 3,
    recommendationReason: 'Delivered 3 time(s) to this drop-off location before (familiar route)',
  },
  {
    driver: mockDrivers[2],
    locationDeliveryCount: 0,
    recommendationReason: 'Available driver',
  },
];
