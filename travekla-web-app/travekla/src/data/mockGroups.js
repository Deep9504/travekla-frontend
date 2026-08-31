export const mockGroups = [
  {
    id: 1,
    creator: { name: "Aarav Sharma", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" },
    from: "Mumbai",
    to: "Goa",
    date: "2025-02-14",
    description: "Relaxed beach trip. Looking for people who love seafood and sunsets. No loud parties.",
    membersJoined: 3,
    capacity: 5,
    isVerified: true,

    // --- NEW SECTIONS ---
    aboutTour: "A 3-day relaxation trip covering North Goa's hidden beaches. We will explore Vagator, Anjuna, and have a private sunset dinner.",
    aboutGroup: "We are a mix of working professionals aged 24-30. We love music and good food.",
    accommodation: "Stay at 'The Hosteller, Goa' in mixed dorms. AC and WiFi included. Clean washrooms guaranteed.",
    aboutTraveler: "Perfect for solo travelers who want to socialize but also need some 'me time'. Moderate walking involved.",
    privacySafety: "Verified profiles only. Female-friendly environment. We share live location with family.",
    paymentCancellation: "Total Cost: ₹5,000 (Split). 50% advance required. Full refund if cancelled 3 days before.",
    
    gallery: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540206395-688085723adb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop"
    ],
    
    reviews: [
      { user: "Priya K.", rating: 5, comment: "Aarav is a great host! The villa was amazing." },
      { user: "Sam", rating: 4, comment: "Great trip, but the bus was a bit late." }
    ]
  },
  {
    id: 2,
    creator: { name: "Sneha Gupta", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha" },
    from: "Delhi",
    to: "Manali",
    date: "2025-03-10",
    description: "Workation trip! We work during the day and explore cafes in the evening. Good wifi needed.",
    membersJoined: 2,
    capacity: 4,
    isVerified: false,
    
  },
  {
    id: 3,
    creator: { name: "John Doe", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    from: "Bangalore",
    to: "Coorg",
    date: "2025-04-05",
    description: "Weekend biking trip. Own bike required. We will start early morning.",
    membersJoined: 6,
    capacity: 10,
    isVerified: true,
  },
];