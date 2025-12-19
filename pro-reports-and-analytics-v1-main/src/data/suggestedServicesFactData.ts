/**
 * Unified fact table for Suggested Services responses.
 * Both Touch Points tab (aggregated) and Responses tab (list) derive from this single source.
 *
 * Definition: 1 response = 1 response invoice that contains at least one SS item from that touch point.
 * - If a customer buys 2 SS items on the same invoice, it's still 1 response.
 * - If they have 2 separate response invoices from different drops/touch points, that's 2 responses.
 */

export type ChannelType = "email" | "text" | "postcard";

export type SsFactResponse = {
  id: string;
  // Customer info
  customerName: string;
  customerEmail?: string;
  // Store info
  storeId: string;
  storeLabel: string;
  // Vehicle info
  vehicleLabel: string;
  // Touch point info
  touchpointId: number;
  touchpointName: string;
  touchpointTiming: string;
  channel: ChannelType;
  // Dates
  sendDate: string;
  openedDate?: string;
  // Original invoice
  originalInvoiceId: string;
  originalInvoiceDate: string;
  originalInvoiceAmount: number;
  originalMileage: number;
  // Suggestions made
  suggestions: {
    id: string;
    name: string;
    videoWatched?: boolean;
    couponOpened?: boolean;
    offerText?: string;
  }[];
  // Response invoice (null if no response yet)
  responseInvoiceId?: string;
  responseDate?: string;
  responseAmount?: number;
  responseDaysLater?: number;
  responseMilesLater?: number;
  servicesPurchased?: string[];
  offerType?: "coupon" | "discount";
  offerCode?: string;
  offerDescription?: string;
  // Response window tracking
  responseWindowDays: number; // 60 for postcard, 10 for email/text
  isWithinWindow: boolean;
};

/**
 * Touch point configuration with send counts.
 * Responses are calculated from the fact data.
 */
export type SsTouchpointConfig = {
  id: number;
  name: string;
  timing: string;
  channel: ChannelType;
  sent: number;
  opened: number;
  daysSinceLastSend?: number;
};

// Touch point configurations (send/open counts are campaign-level metrics)
export const SS_TOUCHPOINT_CONFIGS: SsTouchpointConfig[] = [
  { id: 1, name: "Suggested Services", timing: "1 week after service", channel: "email", sent: 1850, opened: 1295, daysSinceLastSend: 3 },
  { id: 2, name: "Suggested Services", timing: "1 month after service", channel: "email", sent: 1760, opened: 1232, daysSinceLastSend: 7 },
  { id: 3, name: "Suggested Services", timing: "3 months after service", channel: "email", sent: 1640, opened: 1148, daysSinceLastSend: 12 },
  { id: 4, name: "Suggested Services", timing: "6 months after service", channel: "email", sent: 1380, opened: 966, daysSinceLastSend: 15 },
];

// Single source of truth: all SS responses
// Each row = 1 response invoice tied to 1 SS touch point
export const SS_FACT_RESPONSES: SsFactResponse[] = [
  {
    id: "r1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2019 Honda Accord – VA-ABC1234",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "10-05-2025",
    openedDate: "10-05-2025",
    originalInvoiceId: "198001",
    originalInvoiceDate: "10-01-2025",
    originalInvoiceAmount: 89.95,
    originalMileage: 52340,
    suggestions: [
      { id: "s1", name: "Transmission Service", videoWatched: true, couponOpened: true, offerText: "$20 off" },
      { id: "s2", name: "Cabin Air Filter", videoWatched: false, couponOpened: true },
    ],
    responseInvoiceId: "198041",
    responseDate: "10-12-2025",
    responseAmount: 245.00,
    responseDaysLater: 7,
    responseMilesLater: 120,
    servicesPurchased: ["Transmission Service", "Cabin Air Filter"],
    offerType: "coupon",
    offerCode: "TRANS20",
    offerDescription: "$20 off transmission service",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r2",
    customerName: "Michael Chen",
    customerEmail: "mchen@gmail.com",
    storeId: "0221",
    storeLabel: "0221 · Express Lube · Arlington, VA",
    vehicleLabel: "2017 Toyota Camry – VA-XYZ5678",
    touchpointId: 2,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 month after service",
    channel: "email",
    sendDate: "10-28-2025",
    openedDate: "10-29-2025",
    originalInvoiceId: "197845",
    originalInvoiceDate: "09-28-2025",
    originalInvoiceAmount: 45.99,
    originalMileage: 78200,
    suggestions: [
      { id: "s3", name: "Brake Service", videoWatched: true, couponOpened: false, offerText: "$15 off" },
      { id: "s4", name: "Serpentine Belt", videoWatched: false, couponOpened: false },
    ],
    responseInvoiceId: "198102",
    responseDate: "11-02-2025",
    responseAmount: 189.00,
    responseDaysLater: 5,
    responseMilesLater: 85,
    servicesPurchased: ["Brake Service"],
    offerType: "discount",
    offerCode: "BRAKE15",
    offerDescription: "$15 off brake service",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r3",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.rod@yahoo.com",
    storeId: "0445",
    storeLabel: "0445 · Quick Oil · Fairfax, VA",
    vehicleLabel: "2020 Mazda CX-5 – VA-DEF9012",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "10-22-2025",
    openedDate: "10-23-2025",
    originalInvoiceId: "197990",
    originalInvoiceDate: "10-15-2025",
    originalInvoiceAmount: 62.50,
    originalMileage: 34500,
    suggestions: [
      { id: "s5", name: "Air Filter", videoWatched: false, couponOpened: false },
      { id: "s6", name: "Wiper Blades", videoWatched: false, couponOpened: false },
    ],
    // No response yet
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r4",
    customerName: "David Thompson",
    customerEmail: "dthompson@work.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2016 Ford F-150 – VA-TRK4567",
    touchpointId: 3,
    touchpointName: "Suggested Services",
    touchpointTiming: "3 months after service",
    channel: "email",
    sendDate: "12-20-2025",
    openedDate: "12-21-2025",
    originalInvoiceId: "197802",
    originalInvoiceDate: "09-20-2025",
    originalInvoiceAmount: 125.00,
    originalMileage: 95200,
    suggestions: [
      { id: "s7", name: "Transfer Case Service", videoWatched: true, couponOpened: true, offerText: "$25 off" },
      { id: "s8", name: "Rear Diff Service", videoWatched: true, couponOpened: false },
      { id: "s9", name: "Front Diff Service", videoWatched: false, couponOpened: false },
    ],
    responseInvoiceId: "198250",
    responseDate: "12-28-2025",
    responseAmount: 385.00,
    responseDaysLater: 8,
    responseMilesLater: 450,
    servicesPurchased: ["Transfer Case Service", "Rear Diff Service"],
    offerType: "coupon",
    offerCode: "TRANSFER25",
    offerDescription: "$25 off transfer case service",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r5",
    customerName: "Jennifer Martinez",
    storeId: "0221",
    storeLabel: "0221 · Express Lube · Arlington, VA",
    vehicleLabel: "2021 Hyundai Sonata – VA-HYU8901",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "11-01-2025",
    openedDate: "11-02-2025",
    originalInvoiceId: "198050",
    originalInvoiceDate: "10-25-2025",
    originalInvoiceAmount: 55.00,
    originalMileage: 22100,
    suggestions: [
      { id: "s10", name: "Fuel Injection Service", videoWatched: true, couponOpened: true, offerText: "$10 off" },
    ],
    // No response yet
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r6",
    customerName: "Robert Williams",
    customerEmail: "rwilliams@mail.com",
    storeId: "0445",
    storeLabel: "0445 · Quick Oil · Fairfax, VA",
    vehicleLabel: "2018 Chevrolet Silverado – VA-SLV2468",
    touchpointId: 2,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 month after service",
    channel: "email",
    sendDate: "11-10-2025",
    openedDate: "11-11-2025",
    originalInvoiceId: "197920",
    originalInvoiceDate: "10-10-2025",
    originalInvoiceAmount: 98.50,
    originalMileage: 67800,
    suggestions: [
      { id: "s11", name: "Power Steering Flush", videoWatched: true, couponOpened: true, offerText: "10% off" },
      { id: "s12", name: "Radiator Service", videoWatched: false, couponOpened: false },
    ],
    responseInvoiceId: "198320",
    responseDate: "11-18-2025",
    responseAmount: 275.00,
    responseDaysLater: 8,
    responseMilesLater: 180,
    servicesPurchased: ["Power Steering Flush", "Radiator Service"],
    offerType: "discount",
    offerCode: "STEERING10",
    offerDescription: "10% off power steering flush",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r7",
    customerName: "Amanda Foster",
    customerEmail: "afoster@company.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2022 Subaru Outback – VA-SUB1357",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "11-06-2025",
    openedDate: "11-06-2025",
    originalInvoiceId: "198100",
    originalInvoiceDate: "10-30-2025",
    originalInvoiceAmount: 72.00,
    originalMileage: 18500,
    suggestions: [
      { id: "s13", name: "Engine Air Filter", videoWatched: true, couponOpened: true, offerText: "$8 off" },
    ],
    responseInvoiceId: "198380",
    responseDate: "11-12-2025",
    responseAmount: 45.00,
    responseDaysLater: 6,
    responseMilesLater: 95,
    servicesPurchased: ["Engine Air Filter"],
    offerType: "coupon",
    offerCode: "AIRFILTER8",
    offerDescription: "$8 off engine air filter",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  // Additional responses to match touch point counts
  {
    id: "r8",
    customerName: "James Wilson",
    customerEmail: "jwilson@email.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2020 Toyota RAV4 – VA-RAV9876",
    touchpointId: 4,
    touchpointName: "Suggested Services",
    touchpointTiming: "6 months after service",
    channel: "email",
    sendDate: "11-15-2025",
    openedDate: "11-16-2025",
    originalInvoiceId: "197500",
    originalInvoiceDate: "05-15-2025",
    originalInvoiceAmount: 85.00,
    originalMileage: 42000,
    suggestions: [
      { id: "s14", name: "Brake Fluid Flush", videoWatched: true, couponOpened: true, offerText: "$15 off" },
    ],
    responseInvoiceId: "198400",
    responseDate: "11-22-2025",
    responseAmount: 165.00,
    responseDaysLater: 7,
    responseMilesLater: 150,
    servicesPurchased: ["Brake Fluid Flush"],
    offerType: "coupon",
    offerCode: "BRAKE15",
    offerDescription: "$15 off brake fluid flush",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "r9",
    customerName: "Linda Brown",
    customerEmail: "lbrown@mail.com",
    storeId: "0221",
    storeLabel: "0221 · Express Lube · Arlington, VA",
    vehicleLabel: "2019 Nissan Altima – VA-ALT5432",
    touchpointId: 4,
    touchpointName: "Suggested Services",
    touchpointTiming: "6 months after service",
    channel: "email",
    sendDate: "11-20-2025",
    openedDate: "11-21-2025",
    originalInvoiceId: "197550",
    originalInvoiceDate: "05-20-2025",
    originalInvoiceAmount: 65.00,
    originalMileage: 55000,
    suggestions: [
      { id: "s15", name: "Coolant Flush", videoWatched: false, couponOpened: true, offerText: "$20 off" },
    ],
    responseInvoiceId: "198450",
    responseDate: "11-28-2025",
    responseAmount: 195.00,
    responseDaysLater: 8,
    responseMilesLater: 200,
    servicesPurchased: ["Coolant Flush"],
    offerType: "coupon",
    offerCode: "COOL20",
    offerDescription: "$20 off coolant flush",
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  // --- OPENED ONLY (no conversion) ---
  {
    id: "open_01",
    customerName: "Jamie Carter",
    customerEmail: "jcarter@gmail.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2017 Honda Civic – VA-BC9123",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "10-12-2025",
    openedDate: "10-12-2025",
    originalInvoiceId: "198500",
    originalInvoiceDate: "10-05-2025",
    originalInvoiceAmount: 58.00,
    originalMileage: 48200,
    suggestions: [
      { id: "s20", name: "Tire Rotation", videoWatched: true, couponOpened: false },
    ],
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "open_02",
    customerName: "Olivia Reyes",
    customerEmail: "oreyes@yahoo.com",
    storeId: "0445",
    storeLabel: "0445 · Quick Oil · Fairfax, VA",
    vehicleLabel: "2016 Ford Escape – VA-XJ7712",
    touchpointId: 2,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 month after service",
    channel: "email",
    sendDate: "10-19-2025",
    openedDate: "10-20-2025",
    originalInvoiceId: "198510",
    originalInvoiceDate: "09-19-2025",
    originalInvoiceAmount: 72.50,
    originalMileage: 61000,
    suggestions: [
      { id: "s21", name: "Timing Belt", videoWatched: false, couponOpened: true, offerText: "$30 off" },
    ],
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "open_03",
    customerName: "Daniel Kim",
    customerEmail: "dkim@work.com",
    storeId: "0221",
    storeLabel: "0221 · Express Lube · Arlington, VA",
    vehicleLabel: "2018 Toyota Corolla – VA-QP2290",
    touchpointId: 3,
    touchpointName: "Suggested Services",
    touchpointTiming: "3 months after service",
    channel: "email",
    sendDate: "11-02-2025",
    openedDate: "11-02-2025",
    originalInvoiceId: "198520",
    originalInvoiceDate: "08-02-2025",
    originalInvoiceAmount: 45.00,
    originalMileage: 39500,
    suggestions: [
      { id: "s22", name: "Spark Plugs", videoWatched: true, couponOpened: true, offerText: "$15 off" },
    ],
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "open_04",
    customerName: "Mia Thompson",
    customerEmail: "mia.t@gmail.com",
    storeId: "0334",
    storeLabel: "0334 · GMF · Richmond, VA",
    vehicleLabel: "2015 Chevrolet Equinox – VA-RM4411",
    touchpointId: 2,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 month after service",
    channel: "email",
    sendDate: "11-09-2025",
    openedDate: "11-10-2025",
    originalInvoiceId: "198530",
    originalInvoiceDate: "10-09-2025",
    originalInvoiceAmount: 55.00,
    originalMileage: 82000,
    suggestions: [
      { id: "s23", name: "CV Axle Inspection", videoWatched: false, couponOpened: false },
    ],
    responseWindowDays: 10,
    isWithinWindow: true,
  },
  {
    id: "open_05",
    customerName: "Chris Patel",
    customerEmail: "cpatel@gmail.com",
    storeId: "0445",
    storeLabel: "0445 · Quick Oil · Fairfax, VA",
    vehicleLabel: "2019 Nissan Altima – VA-ZK5520",
    touchpointId: 1,
    touchpointName: "Suggested Services",
    touchpointTiming: "1 week after service",
    channel: "email",
    sendDate: "11-16-2025",
    openedDate: "11-16-2025",
    originalInvoiceId: "198540",
    originalInvoiceDate: "11-09-2025",
    originalInvoiceAmount: 68.00,
    originalMileage: 27800,
    suggestions: [
      { id: "s24", name: "Battery Test", videoWatched: true, couponOpened: false },
    ],
    responseWindowDays: 10,
    isWithinWindow: true,
  },
];

/**
 * Aggregate fact data by touch point for the Touch Points tab.
 */
export function aggregateTouchpointMetrics(factData: SsFactResponse[], configs: SsTouchpointConfig[]) {
  return configs.map((config) => {
    // Filter fact data for this touch point
    const tpResponses = factData.filter(
      (r) => r.touchpointId === config.id && r.isWithinWindow
    );
    
    // Count responses (invoices with a response)
    const responseCount = tpResponses.filter((r) => r.responseInvoiceId).length;
    
    // Sum revenue
    const revenue = tpResponses
      .filter((r) => r.responseAmount)
      .reduce((sum, r) => sum + (r.responseAmount || 0), 0);
    
    // Calculate response percentage (responses / sent)
    const respPct = config.sent > 0 ? (responseCount / config.sent) * 100 : 0;
    
    // Calculate ROAS (simplified: revenue / (sent * assumed cost per send))
    const costPerSend = 0.15; // Example cost
    const totalCost = config.sent * costPerSend;
    const roas = totalCost > 0 ? revenue / totalCost : 0;

    return {
      ...config,
      channel: config.channel.charAt(0).toUpperCase() + config.channel.slice(1) as "Email" | "Text" | "Postcard",
      responses: responseCount,
      respPct,
      roas,
      revenue,
    };
  });
}

/**
 * Convert fact data to the card format for the Responses tab.
 * Includes records that have openedDate (for "Emails opened" filter) OR responseInvoiceId (for "Converted" filter).
 */
export function convertFactToCardFormat(factData: SsFactResponse[]) {
  return factData
    .filter((r) => r.isWithinWindow && (r.openedDate || r.responseInvoiceId))
    .map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      storeLabel: r.storeLabel,
      vehicleLabel: r.vehicleLabel,
      original: {
        invoiceNumber: r.originalInvoiceId,
        date: r.originalInvoiceDate,
        amount: r.originalInvoiceAmount,
        mileage: r.originalMileage,
        touchpointLabel: `${r.touchpointName} – ${r.touchpointTiming}`,
        channelLabel: r.channel.charAt(0).toUpperCase() + r.channel.slice(1),
        sentDate: r.sendDate,
        openedDate: r.openedDate,
      },
      suggestions: r.suggestions,
      response: {
        invoiceNumber: r.responseInvoiceId,
        date: r.responseDate,
        amount: r.responseAmount,
        daysLater: r.responseDaysLater,
        milesLater: r.responseMilesLater,
        servicesPurchased: r.servicesPurchased,
        offerType: r.offerType,
        offerCode: r.offerCode,
        offerDescription: r.offerDescription,
      },
    }));
}
