/**
 * Indian PIN Code Resolver
 * Provides instant city/state resolution with online India Post API + instant offline fallback dictionary.
 */

// Fallback dictionary for 2-digit PIN code prefixes (India Post Postal Circles)
const PINCODE_PREFIX_MAP: Record<string, { state: string; defaultCity: string }> = {
  // Delhi
  "11": { state: "Delhi", defaultCity: "New Delhi" },
  // Haryana
  "12": { state: "Haryana", defaultCity: "Gurugram" },
  "13": { state: "Haryana", defaultCity: "Ambala" },
  // Punjab / Chandigarh
  "14": { state: "Punjab", defaultCity: "Ludhiana" },
  "15": { state: "Punjab", defaultCity: "Bathinda" },
  "16": { state: "Punjab / Chandigarh", defaultCity: "Chandigarh" },
  // Himachal Pradesh
  "17": { state: "Himachal Pradesh", defaultCity: "Shimla" },
  // Jammu & Kashmir / Ladakh
  "18": { state: "Jammu & Kashmir", defaultCity: "Jammu" },
  "19": { state: "Jammu & Kashmir", defaultCity: "Srinagar" },
  // Uttar Pradesh & Uttarakhand
  "20": { state: "Uttar Pradesh", defaultCity: "Aligarh" },
  "21": { state: "Uttar Pradesh", defaultCity: "Prayagraj" },
  "22": { state: "Uttar Pradesh", defaultCity: "Lucknow" },
  "23": { state: "Uttar Pradesh", defaultCity: "Mirzapur" },
  "24": { state: "Uttarakhand / UP", defaultCity: "Dehradun" },
  "25": { state: "Uttar Pradesh", defaultCity: "Meerut" },
  "26": { state: "Uttar Pradesh", defaultCity: "Bareilly" },
  "27": { state: "Uttar Pradesh", defaultCity: "Gorakhpur" },
  "28": { state: "Uttar Pradesh", defaultCity: "Agra" },
  // Rajasthan
  "30": { state: "Rajasthan", defaultCity: "Jaipur" },
  "31": { state: "Rajasthan", defaultCity: "Udaipur" },
  "32": { state: "Rajasthan", defaultCity: "Kota" },
  "33": { state: "Rajasthan", defaultCity: "Bikaner" },
  "34": { state: "Rajasthan", defaultCity: "Jodhpur" },
  // Gujarat
  "36": { state: "Gujarat", defaultCity: "Rajkot" },
  "37": { state: "Gujarat", defaultCity: "Jamnagar" },
  "38": { state: "Gujarat", defaultCity: "Ahmedabad" },
  "39": { state: "Gujarat", defaultCity: "Surat" },
  // Maharashtra & Goa
  "40": { state: "Maharashtra", defaultCity: "Mumbai" },
  "41": { state: "Maharashtra", defaultCity: "Pune" },
  "42": { state: "Maharashtra", defaultCity: "Nashik" },
  "43": { state: "Maharashtra", defaultCity: "Chhatrapati Sambhajinagar" },
  "44": { state: "Maharashtra", defaultCity: "Nagpur" },
  // Madhya Pradesh & Chhattisgarh
  "45": { state: "Madhya Pradesh", defaultCity: "Indore" },
  "46": { state: "Madhya Pradesh", defaultCity: "Bhopal" },
  "47": { state: "Madhya Pradesh", defaultCity: "Gwalior" },
  "48": { state: "Madhya Pradesh", defaultCity: "Jabalpur" },
  "49": { state: "Chhattisgarh", defaultCity: "Raipur" },
  // Andhra Pradesh & Telangana
  "50": { state: "Telangana", defaultCity: "Hyderabad" },
  "51": { state: "Andhra Pradesh", defaultCity: "Tirupati" },
  "52": { state: "Andhra Pradesh", defaultCity: "Vijayawada" },
  "53": { state: "Andhra Pradesh", defaultCity: "Visakhapatnam" },
  // Karnataka
  "56": { state: "Karnataka", defaultCity: "Bengaluru" },
  "57": { state: "Karnataka", defaultCity: "Mangaluru" },
  "58": { state: "Karnataka", defaultCity: "Hubballi" },
  "59": { state: "Karnataka", defaultCity: "Belagavi" },
  // Tamil Nadu & Puducherry
  "60": { state: "Tamil Nadu", defaultCity: "Chennai" },
  "61": { state: "Tamil Nadu", defaultCity: "Thanjavur" },
  "62": { state: "Tamil Nadu", defaultCity: "Madurai" },
  "63": { state: "Tamil Nadu", defaultCity: "Vellore" },
  "64": { state: "Tamil Nadu", defaultCity: "Coimbatore" },
  // Kerala & Lakshadweep
  "67": { state: "Kerala", defaultCity: "Kozhikode" },
  "68": { state: "Kerala", defaultCity: "Kochi" },
  "69": { state: "Kerala", defaultCity: "Thiruvananthapuram" },
  // West Bengal, Sikkim & Andaman
  "70": { state: "West Bengal", defaultCity: "Kolkata" },
  "71": { state: "West Bengal", defaultCity: "Howrah" },
  "72": { state: "West Bengal", defaultCity: "Midnapore" },
  "73": { state: "West Bengal / Sikkim", defaultCity: "Siliguri" },
  "74": { state: "West Bengal", defaultCity: "North 24 Parganas" },
  // Odisha
  "75": { state: "Odisha", defaultCity: "Bhubaneswar" },
  "76": { state: "Odisha", defaultCity: "Cuttack" },
  "77": { state: "Odisha", defaultCity: "Sambalpur" },
  // North East (Assam, Meghalaya, Manipur, etc.)
  "78": { state: "Assam", defaultCity: "Guwahati" },
  "79": { state: "North Eastern States", defaultCity: "Shillong" },
  // Bihar & Jharkhand
  "80": { state: "Bihar", defaultCity: "Patna" },
  "81": { state: "Bihar", defaultCity: "Bhagalpur" },
  "82": { state: "Jharkhand", defaultCity: "Ranchi" },
  "83": { state: "Jharkhand", defaultCity: "Jamshedpur" },
  "84": { state: "Bihar", defaultCity: "Muzaffarpur" },
  "85": { state: "Bihar", defaultCity: "Purnia" },
};

// Common specific 3-digit overrides
const PINCODE_SPECIFIC_3DIGIT: Record<string, { city: string; state: string }> = {
  "226": { city: "Lucknow", state: "Uttar Pradesh" },
  "201": { city: "Noida / Ghaziabad", state: "Uttar Pradesh" },
  "208": { city: "Kanpur", state: "Uttar Pradesh" },
  "221": { city: "Varanasi", state: "Uttar Pradesh" },
  "282": { city: "Agra", state: "Uttar Pradesh" },
  "122": { city: "Gurugram", state: "Haryana" },
  "121": { city: "Faridabad", state: "Haryana" },
  "110": { city: "New Delhi", state: "Delhi" },
  "400": { city: "Mumbai", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "560": { city: "Bengaluru", state: "Karnataka" },
  "500": { city: "Hyderabad", state: "Telangana" },
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "700": { city: "Kolkata", state: "West Bengal" },
  "302": { city: "Jaipur", state: "Rajasthan" },
  "380": { city: "Ahmedabad", state: "Gujarat" },
  "395": { city: "Surat", state: "Gujarat" },
  "452": { city: "Indore", state: "Madhya Pradesh" },
  "462": { city: "Bhopal", state: "Madhya Pradesh" },
  "800": { city: "Patna", state: "Bihar" },
  "834": { city: "Ranchi", state: "Jharkhand" },
  "751": { city: "Bhubaneswar", state: "Odisha" },
  "781": { city: "Guwahati", state: "Assam" },
  "248": { city: "Dehradun", state: "Uttarakhand" },
};

export interface PincodeLookupResult {
  city: string;
  state: string;
  district?: string;
  postOffice?: string;
  source: "api" | "local";
}

/**
 * Resolves an Indian 6-digit PIN code to City & State.
 * First checks local cache/dictionary for instant (<5ms) UI feedback,
 * then queries the official India Post API for hyper-accurate district details.
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const cleanPin = pincode.replace(/\D/g, "");
  if (cleanPin.length !== 6) return null;

  // 1. Instant dictionary lookup
  let localResult: PincodeLookupResult | null = null;
  const prefix3 = cleanPin.slice(0, 3);
  const prefix2 = cleanPin.slice(0, 2);

  if (PINCODE_SPECIFIC_3DIGIT[prefix3]) {
    localResult = {
      city: PINCODE_SPECIFIC_3DIGIT[prefix3].city,
      state: PINCODE_SPECIFIC_3DIGIT[prefix3].state,
      source: "local",
    };
  } else if (PINCODE_PREFIX_MAP[prefix2]) {
    localResult = {
      city: PINCODE_PREFIX_MAP[prefix2].defaultCity,
      state: PINCODE_PREFIX_MAP[prefix2].state,
      source: "local",
    };
  }

  // 2. Query India Post API for exact post office & district if in browser
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          return {
            city: po.District || po.Division || po.Block || (localResult ? localResult.city : "City"),
            state: po.State || (localResult ? localResult.state : "State"),
            district: po.District,
            postOffice: po.Name,
            source: "api",
          };
        }
      }
    } catch {
      // Fall through to localResult on network timeout or fetch error
    }
  }

  return localResult;
}
