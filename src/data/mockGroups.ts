import type { Group } from "@/types"

// Hyderabad / Madhapur area
const center = { lat: 17.4485, lng: 78.3908 }

// Public avatar URLs (no auth) so deployment doesn't get 401 from external APIs
const avatarColors = ["FCD34D", "F472B6", "FB7185", "C084FC", "67E8F9", "FDE047", "4ADE80", "A78BFA"] as const
const avatarUrl = (name: string, index: number) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name.replace(/\s/g, "+"))}&background=${avatarColors[index % avatarColors.length]}&color=000&size=200`

export const mockGroups: Group[] = [
  {
    id: "school-mates",
    name: "School Mates",
    currentUser: {
      id: "me-1",
      name: "You",
      avatar: avatarUrl("You", 0),
      position: { lat: center.lat - 0.006, lng: center.lng - 0.003 },
      status: { type: "stationary" },
      assistanceRadiusMeters: 800,
    },
    members: [
      {
        id: "sm-1",
        name: "Valli",
        avatar: avatarUrl("Valli", 1),
        position: { lat: center.lat + 0.0045, lng: center.lng + 0.0015 },
        status: { type: "moving", text: "turning right", heading: 45, speed: 1 },
      },
      {
        id: "sm-2",
        name: "Priya",
        avatar: avatarUrl("Priya", 2),
        position: { lat: center.lat + 0.003, lng: center.lng - 0.0024 },
        status: { type: "moving", text: "heading north", heading: 0, speed: 1 },
      },
      {
        id: "sm-3",
        name: "Anjali",
        avatar: avatarUrl("Anjali", 3),
        position: { lat: center.lat + 0.0024, lng: center.lng - 0.0036 },
        status: { type: "moving", text: "slowing down", heading: 180 },
      },
      {
        id: "sm-4",
        name: "Rahul",
        avatar: avatarUrl("Rahul", 4),
        position: { lat: center.lat - 0.0015, lng: center.lng + 0.0045 },
        status: { type: "moving", text: "on the way", heading: 90, speed: 1 },
      },
      {
        id: "sm-5",
        name: "Kavya",
        avatar: avatarUrl("Kavya", 5),
        position: { lat: center.lat - 0.0036, lng: center.lng - 0.0024 },
        status: { type: "moving", text: "rerouting", heading: 270 },
      },
      {
        id: "sm-6",
        name: "Meera",
        avatar: avatarUrl("Meera", 6),
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
      avatar: avatarUrl("You", 7),
      position: { lat: center.lat - 0.006, lng: center.lng - 0.003 },
      status: { type: "stationary" },
      assistanceRadiusMeters: 800,
    },
    members: [
      {
        id: "wf-1",
        name: "Sneha",
        avatar: avatarUrl("Sneha", 0),
        position: { lat: center.lat + 0.006, lng: center.lng },
        status: { type: "moving", text: "on the way", heading: 0 },
      },
      {
        id: "wf-2",
        name: "Arjun",
        avatar: avatarUrl("Arjun", 1),
        position: { lat: center.lat, lng: center.lng + 0.006 },
        status: { type: "moving", text: "heading east", heading: 90, speed: 1 },
      },
    ],
  },
]
