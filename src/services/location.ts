export const getCurrentLocation = async () => ({
  city: 'Bengaluru',
  area: 'Koramangala',
  coordinates: '12.9352, 77.6245',
})

export const getNearbyShelters = async () => [
  { name: 'Safe Haven', distance: '1.2 km', open: true },
  { name: 'City Police Help Desk', distance: '2.1 km', open: true },
  { name: '24x7 Transit Shelter', distance: '3.0 km', open: false },
]

export const getSafeRoute = async () => ({
  label: 'Main Street → Park Avenue → Home',
  eta: '12 mins',
  safetyLevel: 'High',
})
