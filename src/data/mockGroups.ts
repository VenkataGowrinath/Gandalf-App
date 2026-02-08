import type { Group } from "@/types"

// Hyderabad / Madhapur area
const center = { lat: 17.4485, lng: 78.3908 }

// Same API: Anek Desi Log – https://desilog.sivaramp.com (avatars by ID 1–39)
const WOMEN_AVATAR_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const desiAvatar = (id: number) =>
  `https://desilog.sivaramp.com/i/avatars/${id}/200`
const desiAvatarWomen = (index: number) =>
  desiAvatar(WOMEN_AVATAR_IDS[Math.min(index - 1, WOMEN_AVATAR_IDS.length - 1)] ?? 1)

export const mockGroups: Group[] = [
  {
    id: "school-mates",
    name: "School Mates",
    currentUser: {
      id: "me-1",
      name: "You",
      avatar: desiAvatarWomen(1),
      position: { lat: center.lat - 0.006, lng: center.lng - 0.003 },
      status: { type: "stationary" },
      assistanceRadiusMeters: 800,
    },
    members: [
      {
        id: "sm-1",
        name: "Valli",
        avatar: desiAvatarWomen(2),
        position: { lat: center.lat + 0.0045, lng: center.lng + 0.0015 },
        status: { type: "moving", text: "turning right", heading: 45, speed: 1 },
      },
      {
        id: "sm-2",
        name: "Priya",
        avatar: desiAvatarWomen(3),
        position: { lat: center.lat + 0.003, lng: center.lng - 0.0024 },
        status: { type: "moving", text: "heading north", heading: 0, speed: 1 },
      },
      {
        id: "sm-3",
        name: "Anjali",
        avatar: desiAvatarWomen(4),
        position: { lat: center.lat + 0.0024, lng: center.lng - 0.0036 },
        status: { type: "moving", text: "slowing down", heading: 180 },
      },
      {
        id: "sm-4",
        name: "Rahul",
        avatar: desiAvatarWomen(5),
        position: { lat: center.lat - 0.0015, lng: center.lng + 0.0045 },
        status: { type: "moving", text: "on the way", heading: 90, speed: 1 },
      },
      {
        id: "sm-5",
        name: "Kavya",
        avatar: desiAvatarWomen(6),
        position: { lat: center.lat - 0.0036, lng: center.lng - 0.0024 },
        status: { type: "moving", text: "rerouting", heading: 270 },
      },
      {
        id: "sm-6",
        name: "Meera",
        avatar: desiAvatarWomen(7),
        position: { lat: center.lat - 0.0006, lng: center.lng - 0.0045 },
        status: { type: "low_battery", text: "15%" },
      },
    ],
  },
  {
    id: "work-friends",
    name: "Work Friends",
    currentUser: {
      id: "me-2",
      name: "You",
      avatar: desiAvatarWomen(8),
      position: { lat: center.lat - 0.006, lng: center.lng - 0.003 },
      status: { type: "stationary" },
      assistanceRadiusMeters: 800,
    },
    members: [
      {
        id: "wf-1",
        name: "Sneha",
        avatar: desiAvatarWomen(9),
        position: { lat: center.lat + 0.006, lng: center.lng },
        status: { type: "moving", text: "on the way", heading: 0 },
      },
      {
        id: "wf-2",
        name: "Arjun",
        avatar: desiAvatarWomen(10),
        position: { lat: center.lat, lng: center.lng + 0.006 },
        status: { type: "moving", text: "heading east", heading: 90, speed: 1 },
      },
    ],
  },
]
