export const CONTACTS = [
  { id: 1, name: "Ahmed & Sana Raza", phone: "+923001234567", tag: "Booked", weddingDate: "2026-04-21", event: "Nikah + Walima", package: "Premium", avatar: "AS", lastMsg: "Can I book cold drinks?", lastTime: "2m ago", unread: 2 },
  { id: 2, name: "Sara & Ali Khan", phone: "+923009876543", tag: "Inquiry", weddingDate: "2026-04-23", event: "Baraat", package: "Standard", avatar: "SK", lastMsg: "Please send your gallery", lastTime: "1h ago", unread: 1 },
  { id: 3, name: "Fatima & Usman", phone: "+923331122334", tag: "Confirmed", weddingDate: "2026-05-10", event: "Full Wedding", package: "Royal", avatar: "FU", lastMsg: "Thanks! See you on the day", lastTime: "3h ago", unread: 0 },
  { id: 4, name: "Ayesha & Bilal", phone: "+923211234567", tag: "Inquiry", weddingDate: "2026-06-15", event: "Mehndi", package: "Basic", avatar: "AB", lastMsg: "What are your packages?", lastTime: "1d ago", unread: 0 },
  { id: 5, name: "Hira & Kamran", phone: "+923451122334", tag: "Booked", weddingDate: "2026-07-20", event: "Nikah", package: "Premium", avatar: "HK", lastMsg: "Booking confirmed", lastTime: "2d ago", unread: 0 },
];

export const INIT_THREADS = {
  1: [
    { from: "them", text: "Hi! I saw your work on Instagram, stunning photos!", time: "10:00 AM" },
    { from: "bot", text: "Welcome to ReachBot Studio! We are so glad you reached out.\n\nReply with:\n1 - View our Calendar & Availability\n2 - View our Gallery\n3 - Check Packages & Pricing\n4 - Talk to our team", time: "10:00 AM", auto: true },
    { from: "them", text: "1", time: "10:02 AM" },
    { from: "bot", text: "Here is our availability calendar:\nhttps://cal.com/reachbot-studio\n\nPick a slot and we will confirm your booking!", time: "10:02 AM", auto: true },
    { from: "them", text: "2", time: "10:04 AM" },
    { from: "bot", text: "Here is our latest wedding gallery:\nhttps://reachbot.studio/gallery\n\nOver 500+ weddings captured. Take a look!", time: "10:04 AM", auto: true },
    { from: "them", text: "Can I book cold drinks?", time: "10:06 AM" },
  ],
  2: [
    { from: "them", text: "Hello, please send your gallery", time: "Yesterday" },
    { from: "bot", text: "Welcome! Reply 1 for Calendar, 2 for Gallery, 3 for Packages.", time: "Yesterday", auto: true },
    { from: "them", text: "2", time: "Yesterday" },
    { from: "bot", text: "Here is our latest gallery: https://reachbot.studio/gallery", time: "Yesterday", auto: true },
  ],
  3: [
    { from: "them", text: "Everything confirmed!", time: "Apr 15" },
    { from: "me", text: "Amazing! We cannot wait for your special day", time: "Apr 15" },
    { from: "them", text: "Thanks! See you on the day", time: "Apr 15" },
  ],
  4: [
    { from: "them", text: "What are your packages?", time: "Apr 14" },
    { from: "bot", text: "Welcome! Reply 1 for Calendar, 2 for Gallery, 3 for Packages.", time: "Apr 14", auto: true },
  ],
  5: [
    { from: "bot", text: "Reminder: Your wedding is in 3 days! Don't forget to confirm your cold drinks & catering add-ons. Reply YES to confirm.", time: "Apr 17", auto: true },
    { from: "them", text: "Yes please confirm everything!", time: "Apr 17" },
    { from: "me", text: "All confirmed! See you soon", time: "Apr 17" },
    { from: "them", text: "Booking confirmed", time: "Apr 17" },
  ],
};

export const BOOKINGS = [
  { id: 1, client: "Ahmed & Sana Raza", phone: "+923001234567", date: "2026-04-21", event: "Nikah + Walima", package: "Premium", status: "Confirmed", addons: ["Cold Drinks", "Floral Stage"], color: "#10b981" },
  { id: 2, client: "Sara & Ali Khan", phone: "+923009876543", date: "2026-04-23", event: "Baraat", package: "Standard", status: "Pending", addons: ["Cold Drinks"], color: "#f59e0b" },
  { id: 3, client: "Fatima & Usman", phone: "+923331122334", date: "2026-05-10", event: "Full Wedding", package: "Royal", status: "Confirmed", addons: ["Cold Drinks", "Floral Stage", "Drone"], color: "#10b981" },
  { id: 4, client: "Ayesha & Bilal", phone: "+923211234567", date: "2026-06-15", event: "Mehndi", package: "Basic", status: "Inquiry", addons: [], color: "#6366f1" },
  { id: 5, client: "Hira & Kamran", phone: "+923451122334", date: "2026-07-20", event: "Nikah", package: "Premium", status: "Confirmed", addons: ["Cold Drinks"], color: "#10b981" },
];

export const INIT_RULES = [
  { id: 1, trigger: "New User Joins", keyword: "", response: "Welcome to ReachBot Studio!\n\nReply with:\n1 - View our Calendar & Availability\n2 - View our Gallery\n3 - Check Packages & Pricing\n4 - Talk to our team", active: true, type: "welcome" },
  { id: 2, trigger: "User replies 1", keyword: "1", response: "Here is our availability calendar:\nhttps://cal.com/reachbot-studio\n\nPick a slot that works for you!", active: true, type: "calendar", calLink: "https://cal.com/reachbot-studio" },
  { id: 3, trigger: "User replies 2", keyword: "2", response: "Here is our latest wedding gallery:\nhttps://reachbot.studio/gallery\n\nOver 500+ weddings captured!", active: true, type: "gallery", galleryLink: "https://reachbot.studio/gallery" },
  { id: 4, trigger: "User replies 3", keyword: "3", response: "Our Packages:\n\nBasic - Rs. 50,000\nStandard - Rs. 80,000\nPremium - Rs. 1,20,000\nRoyal - Rs. 2,00,000\n\nReply 1 to book your date!", active: true, type: "packages" },
  { id: 5, trigger: "Wedding in 2 Days (Auto)", keyword: "", response: "Your special day is almost here! Just 2 days away!\n\nReminder checklist:\n- Confirm your timeline\n- Share final guest count\n- Any last-minute requests?\n\nWe are excited for you!", active: true, type: "reminder_2d" },
  { id: 6, trigger: "Add-ons Reminder (3 Days Before)", keyword: "", response: "Your wedding is in 3 days!\n\nWould you like to add:\n- Cold Drinks Package\n- Floral Arrangements\n- Drone Coverage\n\nReply YES to confirm add-ons!", active: true, type: "addons_3d" },
];

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "inbox", label: "Inbox", icon: "✉", badge: 3 },
  { id: "autobot", label: "Auto Reply Bot", icon: "⚡" },
  { id: "contacts", label: "Contacts", icon: "◎" },
  { id: "calendar", label: "Calendar", icon: "▦" },
  { id: "bookings", label: "Bookings", icon: "✦" },
  { id: "gallery", label: "Gallery Links", icon: "◉" },
  { id: "reminders", label: "Reminders", icon: "◷" },
  { id: "settings", label: "Settings", icon: "◌" },
];