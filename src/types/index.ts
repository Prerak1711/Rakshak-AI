export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}


export interface SafeRouteInfo {
  label: string
  eta: string
  safetyLevel: string
}
