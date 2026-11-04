/**
 * AYOR Business Configuration & Regulatory Constants
 */

export const BUSINESS_CONFIG = {
  name: "AYOR Fine Jewellery Atelier",
  legalEntity: "Ayor Luxury Joaillerie Private Limited",
  tagline: "Light. Legacy. You.",
  address: "Hazratganj / Aliganj Fine Jewellery Enclave, Lucknow, Uttar Pradesh 226001, India",
  phone: "+91 8808828646",
  whatsapp: "+91 8808828882",
  email: "atelier@ayorjewellery.com",
  website: "https://ayorjewellery.com",
  // GSTIN is left blank for now as requested
  gstin: "", 
  hsnCode: "7113", // Standard Indian HSN for Fine Gold, Diamond & Silver Jewellery
  panThresholdINR: 200000, // Government of India Rule 114B mandatory PAN threshold (Rs. 2,00,000)
  welcomeDiscount: {
    code: "AYOR10",
    percent: 10,
    label: "Flat 10% Welcome Privilege",
    minOrderValue: 0,
  },
};
