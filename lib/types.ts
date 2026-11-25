export interface Destination {
  id: string;
  name: string;
  country: string;
  heroImage: string;
  gallery?: string[];
  summary?: string;
  highlights: string[];
  visaNotes: string;
  defaultItinerary: { day: number; title: string; description: string }[];
  accommodations: {
    name: string;
    rating: number;
    description: string;
    image: string;
  }[];
}

export interface Proposal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  consultantEmail?: string;
  startDate: string;
  endDate: string;
  passengers: number;
  budget?: number;
  totalPrice: number;
  currency: string;
  destinations: Destination[];
  customAgenda: {
    day: number;
    title: string;
    description: string;
    destinationName: string;
  }[];
  pricingItems?: { name: string; amount: number }[];
  consultantNotes: string;
  paymentTerms?: string;
  status: "Draft" | "Sent" | "Approved" | "Changes Requested" | "Declined";
  clientFeedback?: string;
  createdAt: string;
}

export type PublicProposal = Omit<
  Proposal,
  "clientEmail" | "clientPhone" | "budget"
>;

export interface Store {
  destinations: Destination[];
  proposals: Proposal[];
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "consultant";
  isActive: boolean;
  createdAt: string;
}
