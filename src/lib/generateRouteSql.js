import { originAirportCodes, destinationAirportCodes } from '@/lib/airportData.js';

function generateAllRouteSql() {
  const uniqueDestinationAirportCodes = [...new Set(destinationAirportCodes)];

  let fullSqlScript = "-- Full list of routes with placeholder distances and calculated costs\n";
  fullSqlScript += "-- Make sure to update 'distance_km' with actual values after running this script.\n";
  fullSqlScript += "-- Consider clearing the table if you are doing a full refresh and have old/test data:\n";
  fullSqlScript += "-- DELETE FROM public.flight_routes_data;\n\n";

  originAirportCodes.forEach(origin => {
    const airportIdentifier = globalAirportsList.find(a => a.value === origin)?.label || origin;
    fullSqlScript += `-- =====================================================================================\n`;
    fullSqlScript += `-- Origin: ${origin} (${airportIdentifier})\n`;
    fullSqlScript += `-- =====================================================================================\n`;
    fullSqlScript += "INSERT INTO public.flight_routes_data (origin_iata, destination_iata, distance_km, base_cost_per_km, service_fee_percentage, yanker_earnings, sender_shipping_cost) VALUES\n";
    
    const insertsForOrigin = [];
    uniqueDestinationAirportCodes.forEach(destination => {
      if (origin !== destination) {
        const distanceKm = 1000; // Placeholder distance - MUST BE UPDATED
        const baseCostPerKm = 0.037;
        const serviceFeePercentage = 0.13;
        // Calculations are rounded to 2 decimal places
        const yankerEarnings = parseFloat((distanceKm * baseCostPerKm).toFixed(2));
        const senderShippingCost = parseFloat((yankerEarnings * (1 + serviceFeePercentage)).toFixed(2));
        insertsForOrigin.push(`('${origin}', '${destination}', ${distanceKm}, ${baseCostPerKm}, ${serviceFeePercentage}, ${yankerEarnings}, ${senderShippingCost})`);
      }
    });

    if (insertsForOrigin.length > 0) {
      fullSqlScript += insertsForOrigin.join(',\n') + "\nON CONFLICT (origin_iata, destination_iata) DO NOTHING;\n\n";
    } else {
      // Handle case where an origin might not have any valid destinations (e.g., if lists were empty or only contained itself)
      fullSqlScript += `-- No valid destinations for ${origin} after filtering self-loops.\n\n`;
    }
  });

  console.log("SQL Script Generation Complete.\nCopy the entire output below and run it in your Supabase SQL Editor:\n\n");
  console.log(fullSqlScript);
  
  // For easier copy-pasting, you might want to offer it in a way that doesn't get truncated by console limits.
  // For development, logging to console is usually sufficient.
  // Alternatively, this function could return the string to be handled by the caller (e.g., written to a file).
  return fullSqlScript;
}

// To use this script:
// 1. Ensure your Supabase `flight_routes_data` table is created.
// 2. Open your browser's developer console.
// 3. If you have this project running, you might be able to import and run it:
//    import { generateAllRouteSql } from '@/lib/generateRouteSql.js'; // Adjust path if needed
//    generateAllRouteSql();
// 4. Or, more simply, copy the content of this file into your browser's developer console
//    (making sure the import of airportData works, or manually copy those arrays in too),
//    then call generateAllRouteSql();
// 5. The full SQL script will be logged to the console. Copy it from there.

// Example of how to call it if you were to run this file directly with Node.js (requires ESM setup or transpilation)
// if (typeof process !== 'undefined' && process.argv[1] === import.meta.url.substring(7)) { // basic check if script is run directly
//   generateAllRouteSql();
// }

export { generateAllRouteSql };

// Manually copying the airport data here for standalone execution if needed for the developer,
// as direct import might not work if they run this script in an isolated Node environment
// without the project's module resolution fully set up.
const globalAirportsList = [
  { value: "SYD", label: "Sydney (SYD), Australia", region: "Oceania" },
  { value: "MEL", label: "Melbourne (MEL), Australia", region: "Oceania" },
  { value: "BNE", label: "Brisbane (BNE), Australia", region: "Oceania" },
  { value: "PER", label: "Perth (PER), Australia", region: "Oceania" },
  { value: "ADL", label: "Adelaide (ADL), Australia", region: "Oceania" },
  { value: "CBR", label: "Canberra (CBR), Australia", region: "Oceania" },
  { value: "HBA", label: "Hobart (HBA), Australia", region: "Oceania" },
  { value: "DRW", label: "Darwin (DRW), Australia", region: "Oceania" },
  { value: "CNS", label: "Cairns (CNS), Australia", region: "Oceania" },
  { value: "OOL", label: "Gold Coast (OOL), Australia", region: "Oceania" },
  { value: "AKL", label: "Auckland (AKL), New Zealand", region: "Oceania" },
  { value: "WLG", label: "Wellington (WLG), New Zealand", region: "Oceania" },
  { value: "CHC", label: "Christchurch (CHC), New Zealand", region: "Oceania" },
  { value: "ZQN", label: "Queenstown (ZQN), New Zealand", region: "Oceania" },
  { value: "DUD", label: "Dunedin (DUD), New Zealand", region: "Oceania" },
  { value: "LHR", label: "London (LHR), United Kingdom", region: "Europe" },
  { value: "LOS", label: "Lagos (LOS), Nigeria", region: "Africa" },
  { value: "JNB", label: "Johannesburg (JNB), South Africa", region: "Africa" },
  { value: "CPT", label: "Cape Town (CPT), South Africa", region: "Africa" },
  { value: "CAI", label: "Cairo (CAI), Egypt", region: "Africa" },
  { value: "DXB", label: "Dubai (DXB), UAE", region: "Middle East" },
  { value: "YYZ", label: "Toronto (YYZ), Canada", region: "North America" },
  { value: "DFW", label: "Dallas/Fort Worth (DFW), USA", region: "North America" },
  { value: "ORD", label: "Chicago (ORD), USA", region: "North America" },
  { value: "LAX", label: "Los Angeles (LAX), USA", region: "North America" },
  { value: "JFK", label: "New York (JFK), USA", region: "North America" },
  { value: "NBO", label: "Nairobi (NBO), Kenya", region: "Africa" },
  { value: "EBB", label: "Entebbe (EBB), Uganda", region: "Africa" },
  { value: "ADD", label: "Addis Ababa (ADD), Ethiopia", region: "Africa" },
  { value: "DAR", label: "Dar es Salaam (DAR), Tanzania", region: "Africa" },
  { value: "KGL", label: "Kigali (KGL), Rwanda", region: "Africa" },
  { value: "ACC", label: "Accra (ACC), Ghana", region: "Africa" },
  { value: "ABJ", label: "Abidjan (ABJ), Ivory Coast", region: "Africa" },
  { value: "DKR", label: "Dakar (DKR), Senegal", region: "Africa" },
  { value: "CMN", label: "Casablanca (CMN), Morocco", region: "Africa" },
  { value: "TUN", label: "Tunis (TUN), Tunisia", region: "Africa" },
  { value: "ALG", label: "Algiers (ALG), Algeria", region: "Africa" },
  { value: "TIP", label: "Tripoli (TIP), Libya", region: "Africa" },
  { value: "KRT", label: "Khartoum (KRT), Sudan", region: "Africa" },
  { value: "HRE", label: "Harare (HRE), Zimbabwe", region: "Africa" },
  { value: "LUN", label: "Lusaka (LUN), Zambia", region: "Africa" },
  { value: "MPM", label: "Maputo (MPM), Mozambique", region: "Africa" },
  { value: "WDH", label: "Windhoek (WDH), Namibia", region: "Africa" },
  { value: "GBE", label: "Gaborone (GBE), Botswana", region: "Africa" },
  { value: "MRU", label: "Port Louis (MRU), Mauritius", region: "Africa" },
  { value: "SEZ", label: "Victoria (SEZ), Seychelles", region: "Africa" },
  { value: "FIH", label: "Kinshasa (FIH), DR Congo", region: "Africa" },
  { value: "LAD", label: "Luanda (LAD), Angola", region: "Africa" },
  { value: "COO", label: "Cotonou (COO), Benin", region: "Africa" },
  { value: "OUA", label: "Ouagadougou (OUA), Burkina Faso", region: "Africa" },
  { value: "BJM", label: "Bujumbura (BJM), Burundi", region: "Africa" },
  { value: "NDJ", label: "N'Djamena (NDJ), Chad", region: "Africa" },
  { value: "CKY", label: "Conakry (CKY), Guinea", region: "Africa" },
  { value: "ROB", label: "Monrovia (ROB), Liberia", region: "Africa" },
  { value: "LLW", label: "Lilongwe (LLW), Malawi", region: "Africa" },
  { value: "MBA", label: "Mombasa (MBA), Kenya", region: "Africa" },
  { value: "JUB", label: "Juba (JUB), South Sudan", region: "Africa" },
  { value: "DUR", label: "Durban (DUR), South Africa", region: "Africa" },
  { value: "SIN", label: "Singapore (SIN), Singapore", region: "Southeast Asia" },
  { value: "KUL", label: "Kuala Lumpur (KUL), Malaysia", region: "Southeast Asia" },
  { value: "PEN", label: "Penang (PEN), Malaysia", region: "Southeast Asia" },
  { value: "BKK", label: "Bangkok (BKK), Thailand", region: "Southeast Asia" },
  { value: "DMK", label: "Bangkok (DMK), Thailand", region: "Southeast Asia" },
  { value: "MNL", label: "Manila (MNL), Philippines", region: "Southeast Asia" },
  { value: "CEB", label: "Cebu (CEB), Philippines", region: "Southeast Asia" },
  { value: "CGK", label: "Jakarta (CGK), Indonesia", region: "Southeast Asia" },
  { value: "DPS", label: "Denpasar (DPS), Indonesia", region: "Southeast Asia" },
  { value: "SGN", label: "Ho Chi Minh City (SGN), Vietnam", region: "Southeast Asia" },
  { value: "HAN", label: "Hanoi (HAN), Vietnam", region: "Southeast Asia" },
  { value: "PNH", label: "Phnom Penh (PNH), Cambodia", region: "Southeast Asia" },
  { value: "REP", label: "Siem Reap (REP), Cambodia", region: "Southeast Asia" },
  { value: "RGN", label: "Yangon (RGN), Myanmar", region: "Southeast Asia" },
  { value: "MDL", label: "Mandalay (MDL), Myanmar", region: "Southeast Asia" },
  { value: "VTE", label: "Vientiane (VTE), Laos", region: "Southeast Asia" },
  { value: "LPQ", label: "Luang Prabang (LPQ), Laos", region: "Southeast Asia" },
  { value: "BWN", label: "Bandar Seri Begawan (BWN), Brunei", region: "Southeast Asia" },
  { value: "DEL", label: "Delhi (DEL), India", region: "South Asia" },
  { value: "BOM", label: "Mumbai (BOM), India", region: "South Asia" },
  { value: "BLR", label: "Bengaluru (BLR), India", region: "South Asia" },
  { value: "MAA", label: "Chennai (MAA), India", region: "South Asia" },
  { value: "HYD", label: "Hyderabad (HYD), India", region: "South Asia" },
  { value: "CCU", label: "Kolkata (CCU), India", region: "South Asia" },
  { value: "AMD", label: "Ahmedabad (AMD), India", region: "South Asia" },
  { value: "PNQ", label: "Pune (PNQ), India", region: "South Asia" },
  { value: "COK", label: "Kochi (COK), India", region: "South Asia" },
  { value: "GOI", label: "Goa (GOI), India", region: "South Asia" },
  { value: "IXC", label: "Chandigarh (IXC), India", region: "South Asia" },
  { value: "CDG", label: "Paris (CDG), France", region: "Europe" },
  { value: "AMS", label: "Amsterdam (AMS), Netherlands", region: "Europe" },
  { value: "FRA", label: "Frankfurt (FRA), Germany", region: "Europe" },
  { value: "IST", label: "Istanbul (IST), Turkey", region: "Europe/Asia" },
  { value: "DOH", label: "Doha (DOH), Qatar", region: "Middle East" },
  { value: "AUH", label: "Abu Dhabi (AUH), UAE", region: "Middle East" },
  { value: "PEK", label: "Beijing (PEK), China", region: "East Asia" },
  { value: "PKX", label: "Beijing (PKX), China", region: "East Asia" },
  { value: "PVG", label: "Shanghai (PVG), China", region: "East Asia" },
  { value: "ICN", label: "Seoul (ICN), South Korea", region: "East Asia" },
  { value: "NRT", label: "Tokyo (NRT), Japan", region: "East Asia" },
  { value: "HND", label: "Tokyo (HND), Japan", region: "East Asia" },
];