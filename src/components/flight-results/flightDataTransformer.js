import { format, parseISO, isValid } from 'date-fns';

    export const transformApiDataToFlights = (apiData, searchCriteria) => {
      if (!apiData || !apiData.fares || apiData.fares.length === 0) return [];
      
      const flights = apiData.fares.map((fare) => {
        const firstLegDetails = fare.legs[0];
        const lastLegDetails = fare.legs[fare.legs.length - 1];
        const firstSegment = firstLegDetails.segments[0];
        const lastSegment = lastLegDetails.segments[lastLegDetails.segments.length - 1];

        let totalDurationMinutes = 0;
        fare.legs.forEach(leg => {
          leg.segments.forEach(segment => {
            totalDurationMinutes += segment.flightDuration;
          });
          if (leg.layoverDuration) {
            totalDurationMinutes += leg.layoverDuration;
          }
        });
        const hours = Math.floor(totalDurationMinutes / 60);
        const minutes = totalDurationMinutes % 60;
        const totalDurationFormatted = `${hours}h ${minutes}m`;
        
        let stops = 0;
        fare.legs.forEach(leg => {
          stops += (leg.segments.length -1);
        });
        const stopDescription = stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`;

        return {
          id: fare.id,
          airline: firstSegment.airline.name, 
          airlineCode: firstSegment.airline.code,
          airlineLogoKey: firstSegment.airline.code.toLowerCase(), 
          from: firstSegment.departureAirport.code,
          to: lastSegment.arrivalAirport.code,
          departureTime: format(parseISO(firstSegment.departureDateTime), 'HH:mm'),
          arrivalTime: format(parseISO(lastSegment.arrivalDateTime), 'HH:mm'),
          departureDate: format(parseISO(firstSegment.departureDateTime), 'yyyy-MM-dd'),
          duration: totalDurationFormatted,
          stops: stopDescription,
          price: parseFloat(fare.price.totalAmount), 
          currency: fare.price.currency.code,
          standardBaggage: 'Standard baggage included', 
          deeplink: fare.deeplink,
        };
      });
      return flights;
    };

    export const transformFlightDataFromDb = (dbFlight) => {
      const departureDateTime = parseISO(dbFlight.departure_time);
      const arrivalDateTime = parseISO(dbFlight.arrival_time);
    
      let duration = "N/A";
      if (isValid(departureDateTime) && isValid(arrivalDateTime)) {
        const diffMs = arrivalDateTime - departureDateTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${diffHours}h ${diffMinutes}m`;
      }
    
      return {
        id: dbFlight.id, 
        airline: dbFlight.flight_number?.substring(0,2) || "N/A",
        airlineCode: dbFlight.flight_number?.substring(0,2) || "N/A",
        airlineLogoKey: dbFlight.flight_number?.substring(0,2).toLowerCase() || "default",
        from: dbFlight.departure_airport,
        to: dbFlight.arrival_airport,
        departureTime: isValid(departureDateTime) ? format(departureDateTime, 'HH:mm') : "N/A",
        arrivalTime: isValid(arrivalDateTime) ? format(arrivalDateTime, 'HH:mm') : "N/A",
        departureDate: isValid(departureDateTime) ? format(departureDateTime, 'yyyy-MM-dd') : "N/A",
        duration: duration,
        stops: dbFlight.layover_airports && dbFlight.layover_airports.length > 0 ? `${dbFlight.layover_airports.length} stop(s)` : 'Direct',
        layovers: dbFlight.layover_airports || [],
        price: parseFloat(dbFlight.price),
        currency: 'AUD', 
        standardBaggage: 'Standard baggage included', 
        distance: parseFloat(dbFlight.distance),
        deeplink: null, 
      };
    };