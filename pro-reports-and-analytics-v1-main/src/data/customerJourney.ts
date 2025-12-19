// src/data/customerJourney.ts

export type JourneyTouchPointId =
  | "thank-you-text"
  | "thank-you-email"
  | "ss-1-week"
  | "second-vehicle"
  | "ss-1-month"
  | "ss-3-months"
  | "ss-6-months"
  | "newsletter-monthly"
  | "reminder-1"
  | "reminder-2"
  | "reminder-3"
  | "reminder-4"
  | "reactivation-12"
  | "reactivation-18"
  | "reactivation-24";

// ZIP-level statistics for touch point drill-downs
export type JourneyZipStat = {
  zip: string;
  city: string;
  state: string;
  respPct: number;
  responses: number;
  activeCustomers: number;
  loyalCustomers: number;
  genderMalePct: number; // female = 100 - male
  vehicleAgeMix: { label: string; pct: number }[];
};

const makeZipStats = (baseRespPct: number, totalResponses: number): JourneyZipStat[] => {
  const r1 = Math.round(totalResponses * 0.4);
  const r2 = Math.round(totalResponses * 0.35);
  const r3 = Math.max(totalResponses - r1 - r2, 0);

  return [
    {
      zip: "94110",
      city: "San Francisco",
      state: "CA",
      respPct: baseRespPct + 1.5,
      responses: r1,
      activeCustomers: 178,
      loyalCustomers: 52,
      genderMalePct: 53,
      vehicleAgeMix: [
        { label: "0–5 yrs", pct: 39 },
        { label: "6–10 yrs", pct: 41 },
        { label: "11+ yrs", pct: 20 },
      ],
    },
    {
      zip: "94901",
      city: "San Rafael",
      state: "CA",
      respPct: baseRespPct,
      responses: r2,
      activeCustomers: 142,
      loyalCustomers: 41,
      genderMalePct: 49,
      vehicleAgeMix: [
        { label: "0–5 yrs", pct: 34 },
        { label: "6–10 yrs", pct: 43 },
        { label: "11+ yrs", pct: 23 },
      ],
    },
    {
      zip: "95401",
      city: "Santa Rosa",
      state: "CA",
      respPct: baseRespPct - 1.8,
      responses: r3,
      activeCustomers: 121,
      loyalCustomers: 33,
      genderMalePct: 56,
      vehicleAgeMix: [
        { label: "0–5 yrs", pct: 29 },
        { label: "6–10 yrs", pct: 46 },
        { label: "11+ yrs", pct: 25 },
      ],
    },
  ];
};

export type JourneyTouchPoint = {
  id: JourneyTouchPointId;
  name: string;
  interval: string;
  channel: string;
  sent: number;
  vehicles: number;
  responseRate: number;
  roas: number;
  zipStats?: JourneyZipStat[];
};

export const JOURNEY_TOUCH_POINTS: JourneyTouchPoint[] = [
  {
    id: "thank-you-text",
    name: "Thank You",
    interval: "1 day after Service",
    channel: "Text",
    sent: 1850,
    vehicles: 420,
    responseRate: 22.7,
    roas: 9.5,
    zipStats: makeZipStats(22.7, 420),
  },
  {
    id: "thank-you-email",
    name: "Thank You",
    interval: "1 day after Service",
    channel: "Email",
    sent: 1850,
    vehicles: 420,
    responseRate: 22.7,
    roas: 9.5,
    zipStats: makeZipStats(22.7, 420),
  },
  {
    id: "ss-1-week",
    name: "Suggested Services",
    interval: "1 week after Service",
    channel: "Email",
    sent: 1760,
    vehicles: 310,
    responseRate: 17.6,
    roas: 12.1,
    zipStats: makeZipStats(17.6, 310),
  },
  {
    id: "second-vehicle",
    name: "2nd Vehicle Invitation",
    interval: "10 days after Service",
    channel: "Email",
    sent: 900,
    vehicles: 150,
    responseRate: 16.7,
    roas: 10.3,
    zipStats: makeZipStats(16.7, 150),
  },
  {
    id: "ss-1-month",
    name: "Suggested Services",
    interval: "1 month after Service",
    channel: "Email",
    sent: 1640,
    vehicles: 240,
    responseRate: 14.6,
    roas: 11.2,
    zipStats: makeZipStats(14.6, 240),
  },
  {
    id: "ss-3-months",
    name: "Suggested Services",
    interval: "3 months after Service",
    channel: "Email",
    sent: 1520,
    vehicles: 230,
    responseRate: 15.1,
    roas: 10.9,
    zipStats: makeZipStats(15.1, 230),
  },
  {
    id: "ss-6-months",
    name: "Suggested Services",
    interval: "6 months after Service",
    channel: "Email",
    sent: 1380,
    vehicles: 210,
    responseRate: 15.2,
    roas: 10.8,
    zipStats: makeZipStats(15.2, 210),
  },
  {
    id: "newsletter-monthly",
    name: "Monthly Newsletter",
    interval: "Once a month",
    channel: "Email",
    sent: 4200,
    vehicles: 520,
    responseRate: 12.4,
    roas: 7.8,
    zipStats: makeZipStats(12.4, 520),
  },
  {
    id: "reminder-1",
    name: "Reminder 1",
    interval: "5k after last Service",
    channel: "Postcard + Email + Text",
    sent: 1380,
    vehicles: 280,
    responseRate: 20.3,
    roas: 16.4,
    zipStats: makeZipStats(20.3, 280),
  },
  {
    id: "reminder-2",
    name: "Reminder 2",
    interval: "30 days after Reminder 1",
    channel: "Postcard + Email + Text",
    sent: 980,
    vehicles: 142,
    responseRate: 14.5,
    roas: 10.7,
    zipStats: makeZipStats(14.5, 142),
  },
  {
    id: "reminder-3",
    name: "Reminder 3",
    interval: "10k after last Service",
    channel: "Postcard + Email + Text",
    sent: 860,
    vehicles: 120,
    responseRate: 14.0,
    roas: 9.8,
    zipStats: makeZipStats(14.0, 120),
  },
  {
    id: "reminder-4",
    name: "Reminder 4",
    interval: "15k after last Service",
    channel: "Postcard + Email + Text",
    sent: 740,
    vehicles: 105,
    responseRate: 14.2,
    roas: 9.4,
    zipStats: makeZipStats(14.2, 105),
  },
  {
    id: "reactivation-12",
    name: "Reactivation",
    interval: "12 months after Service",
    channel: "Email",
    sent: 620,
    vehicles: 86,
    responseRate: 13.9,
    roas: 8.2,
    zipStats: makeZipStats(13.9, 86),
  },
  {
    id: "reactivation-18",
    name: "Reactivation",
    interval: "18 months after Service",
    channel: "Email",
    sent: 480,
    vehicles: 64,
    responseRate: 13.3,
    roas: 7.5,
    zipStats: makeZipStats(13.3, 64),
  },
  {
    id: "reactivation-24",
    name: "Reactivation",
    interval: "24 months after Service",
    channel: "Email",
    sent: 360,
    vehicles: 46,
    responseRate: 12.8,
    roas: 7.1,
    zipStats: makeZipStats(12.8, 46),
  },
];

export const getJourneyTouchPointById = (id: string) => JOURNEY_TOUCH_POINTS.find((tp) => tp.id === id);
