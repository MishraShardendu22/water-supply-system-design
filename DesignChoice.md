# Design Choice 
- This document captures the design direction and the reasoning behind it.

1. Requests currently arrive through phone calls, written letters, visits to the municipal office and referrals from elected representatives.

Solution - Add a possible digital channel as a subsitute to the manual process of receiving requests, becuase the mediums can be unreliable and can be manipulated by influential representatives.
    - Letters can be lost, ignored or be completely fabricated.
    - Visits and Referrals can be manipulated by influential representatives.
    - Phone call can introduce human error, can be manipulated and can also be a fake prank call.

What about the old channels?
    - Old channels are part of the existing environment. 
    - Requiring everyone to use a new application could exclude residents who cannot or do not want to use it. 
    - There can a reciever who can receive the requests on behalf of the residents and submit it to the application. 
    - This can be a local representative or a person from the municipal office.

2. Informal settlements often lack formal addresses 
    - Add a feature that must represent destinations geographically rather than depending on formal addresses.
    - This can be done by sharing a WhatsApp location, Google Maps Location that can be put on a proper map.
    - The driver can verify he got the live location and can reach the person without any issues.
    - The specific location must also mention solve guidance or landmark to help the driver reach the person.
    - We will also keep a record of which driver has been to which location, so that the driver can be assigned to the same location in future requests, if possible.

3. Drivers may have basic phones rather than smartphones
    - Mark Routes as generic, complex on the application based on the drop off locations, so drivers with normal phones can follow the route without any issues. (Driver gets eay to follow route as mentioned above)
    - Generate routes using familiar roads, landmarks, and known locations so that a driver can follow them without requiring smartphone-based turn-by-turn navigation.

4. Some neighbourhoods have private borewells but still request municipal water
    - Add a feature to flag the district and the representive of the district, so that they verify first.
    - Based on the municipal corporation’s research, if a neighbourhood is found to have a private borewell while requesting a tanker, the municipality marks the neighbourhood as false. We can still accept their request, but it will have a very low priority and might not receive anything.
    - We will automatically mark the request for water after a month for all request even if they are not full-filled as NOT-COMPLETED.

5. Traffic conditions strongly affect delivery time
    - Add a feature to allow the driver to share the live location on some platform like whatsapp, so that the person can track the driver and can be ready to receive the water tanker. 
    - Also mark deposit locations as usually heavy traffic areas, so that the driver can plan his route accordingly.

    Basically =>
    Location
      ├── traffic risk
      └── normal travel timetraffic risk


6. Water availability at filling stations changes during the day
    - If a station has too many trucks at a time mark it as busy, so that the driver can plan his route accordingly.

    Filling Station
        ↓
    Availability
        ↓
    Expected wait
        ↓
    Dispatch decision

7. The system must continue functioning during power or internet outages
    - Core request/dispatch information is locally cached, and state changes made while offline are queued for synchronization when connectivity returns.

8. Any prioritisation process may be challenged by residents or local representatives
    - The system should have a transparent and fair prioritisation mechanism to address such challenges.
    - Representatives and residents shouldnt be able to manipulate the system to their advantage.
    - Hospital and Schools need priority treatment, so that will be the first priority, the based on the previous history and avaialability of water, the requests will be prioritised.

9. The municipality has limited authority over contracted tanker drivers
    - If there is a failure in delivery the driver would be penalised and the municipality can take action against the driver, so that the drivers are more responsible and accountable for their actions. (Have a Rating system for the drivers)
    - Proof of delivery will be a basic otp system, where the community person will share the otp with the driver, so that the person can mark the delivery as completed.