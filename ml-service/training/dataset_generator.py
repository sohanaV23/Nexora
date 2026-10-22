import csv
import os

TEMPLATES = {
    "Plumbing & Water": [
        "Water leaking under the kitchen sink from drainage pipe joint.",
        "Low water pressure in bathroom shower and health faucet.",
        "Toilet flush cistern running continuously and wasting water.",
        "Overhead terrace water tank overflowing down the exterior wall.",
        "Drainage trap clogged in balcony causing water pooling during rain.",
        "Hot water geyser inlet pipe valve dripping onto tiles.",
        "Municipal water supply not received in storage sump.",
        "Foul odor from utility area floor drain and washing point.",
        "Kitchen mixer tap broken and water flowing continuously.",
        "Water leakage inside ceiling plaster from upper floor flat bathroom.",
        "Basement parking sump pump failed causing waterlogging.",
        "Submersible borewell pump tripped and not pumping water.",
        "Washbasin faucet aerator choked with sand particles.",
        "Bathtub drain valve stuck and refusing to drain water.",
        "Main inlet valve to flat rusted and cannot be shut off.",
        "Dripping air conditioner condensation pipe splashing on walkway.",
        "Sewer inspection chamber near boundary wall overflowing.",
        "RO water purifier wastewater line disconnected and leaking.",
        "Kitchen sink drain pipe joint separated and flooding cabinet.",
        "Shower head spraying water sideways due to limescale blockage."
    ],
    "Electrical": [
        "Master bedroom MCB breaker tripping repeatedly under load.",
        "Common corridor ceiling LED batten light flickering constantly.",
        "Main electrical meter room buzzing and emitting burnt plastic smell.",
        "Power socket in living room sparked when plugging in appliance.",
        "Ceiling fan speed regulator knob broken and stuck at max.",
        "Staircase emergency battery backup lights not illuminating during power cut.",
        "Doorbell chime mechanism jammed and ringing without stopping.",
        "Flat intercom telephone line dead with buzzing static noise.",
        "Kitchen exhaust fan motor making loud grinding bearing noise.",
        "DG generator auto-switchover failed during grid outage.",
        "Terrace halogen perimeter floodlight dangling loose from bracket.",
        "Basement parking row 4 illumination dark due to tripped fuse.",
        "Bathroom light switch plate sparking during operation.",
        "Sub-meter in distribution box not registering power consumption.",
        "Balcony external weatherproof switch box cover cracked.",
        "Elevator lobby chandelier light bulbs fused and unlit.",
        "Earthing leakage current felt on metallic body of water heater.",
        "Clubhouse circuit breaker panel overheated and smelling of smoke.",
        "Landscape garden path bollard lighting wires exposed on ground.",
        "Electric vehicle charging station circuit breaker tripped."
    ],
    "Elevator & Lift": [
        "Passenger Lift 2 jerking and vibrating between 3rd and 4th floor.",
        "Service elevator doors closing forcefully on residents without retracting.",
        "Tower A passenger lift halted between floors with alarm ringing.",
        "Lift car interior fan and emergency cabin lighting not functioning.",
        "Lift button for 7th floor not lighting up or acknowledging press.",
        "Elevator cabin stopping unevenly below landing level creating trip hazard.",
        "In-cabin emergency intercom call button not connecting to gate guard.",
        "Traction motor in lift room humming loudly and echoing into top flats.",
        "Elevator digital position indicator showing inverted garbled text.",
        "Lift door rubber safety edge sensor torn and hanging loose.",
        "Elevator making loud squeaking metallic noise when ascending.",
        "Tower B passenger lift out of service with error code on screen.",
        "Lift ventilation blower dead and cabin getting stifling hot.",
        "Elevator floor selector key lock in cabin loose and spinning.",
        "Slow elevator door opening and closing cycle causing delays.",
        "Elevator emergency battery lowering system failed during test.",
        "Passenger elevator car shaking sideways when passing counterweights.",
        "Lift pit water seepage triggering emergency safety float switch.",
        "Service lift stainless steel wall panel dented by construction workers.",
        "Elevator car ceiling panel loose and rattling during movement."
    ],
    "Cleaning & Waste": [
        "Garbage chute door jammed with overflowing trash bags on 5th floor.",
        "Liquid waste stains and slippery spillage across hallway corridor tiles.",
        "Emergency exit staircase littered with dust and packaging cartons.",
        "Pet waste found unattended on children play area lawn grass.",
        "Basement waste disposal bins overflowing with open foul garbage.",
        "Clubhouse common restroom dirty with choked urinals and no soap.",
        "Pigeon droppings accumulation on exterior window sunshades and AC ledges.",
        "Sewage treatment plant aeration tank emitting unbearable stench.",
        "Corridor garbage collection bag torn and dropped rotting food on carpet.",
        "Terrace rainwater drainage gutters filled with dry leaves and plastic wrappers.",
        "Basement driveway stained with oil slicks and accumulated grease.",
        "Common utility balcony floor dusty and littered with cigarette butts.",
        "Recycling collection bins for cardboard and plastic completely overflowing.",
        "Cobwebs and dust buildup along corridor ceiling cornices.",
        "Stagnant puddle of dirty mop water left in staircase landing.",
        "Swimming pool deck littered with discarded plastic water bottles.",
        "Garbage collection staff missed morning flat door-to-door pickup.",
        "Fly and mosquito breeding in unwashed wet waste bins.",
        "Children sand pit littered with tree twigs and dry dirt.",
        "Stairwell window glass panels covered in thick grime and dust."
    ],
    "Security & Access": [
        "Boom barrier at main entry gate not raising with RFID vehicle tag.",
        "Pedestrian turnstile biometric fingerprint scanner showing connection error.",
        "Security guard podium unattended during midnight shift at Tower B.",
        "Basement parking CCTV surveillance camera tilted facing concrete wall.",
        "Unregistered vehicle parked in visitor slot for over two days.",
        "East boundary wall infrared perimeter intrusion alarm sounding false alerts.",
        "Delivery driver found wandering on upper floors without authorized gate pass.",
        "Main entrance magnetic glass door lock not latching securely.",
        "Security guardhouse intercom not answering resident telephone calls.",
        "Visitors entering premises without recording mobile number or pass code.",
        "Basement fire exit door prop opened with wooden wedge compromising security.",
        "Security guard torchlights batteries dead during night patrol.",
        "Gate security barrier arm dropped prematurely on car bonnet.",
        "Visitor registration tablet touch screen frozen and rebooting in loop.",
        "Unauthorized cab driver arguing with security and refusing to leave.",
        "Tower lobby access card reader beeping red and denying resident tags.",
        "CCTV monitor in central security control room having black screen feed.",
        "Boundary wall razor wire loose and sagging near back gate.",
        "Suspicious individuals loitering near transformer yard after dark.",
        "Emergency panic alarm button at guardhouse unresponsive."
    ],
    "Parking": [
        "Unauthorized stranger car parked in my designated parking bay P-402.",
        "Convex blind-spot safety mirror on basement ramp cracked and displaced.",
        "Car parked across the driveway blocking other residents from driving out.",
        "Overhead plumbing pipe leaking foul wastewater directly onto vehicle roof.",
        "EV slow charging station connector gun locked and refusing to release.",
        "Basement parking slot white line demarcations and numbers completely faded.",
        "Two-wheeler parked in dedicated 4-wheeler slot causing obstruction.",
        "Oil leak puddles on parking bay floor creating slippery hazard.",
        "Visitor vehicle parked in reserved handicap slot near lift lobby.",
        "Bicycle stand overflowing with abandoned broken cycles.",
        "Basement ceiling clearance warning signboard knocked down by truck.",
        "Car alarm going off repeatedly in basement 2 for over an hour.",
        "Delivery scooter parked blocking pedestrian ramp to elevator lobby.",
        "Parking bay lighting fixture flickering directly over slot.",
        "Overhead fire sprinkler pipe touching car roof in low-clearance bay.",
        "Resident washing vehicle in basement causing water puddles.",
        "Visitor parking full due to commercial vehicles parked inside.",
        "Pillar rubber safety corner guard ripped off exposing sharp concrete.",
        "Basement ramp speed breaker bolts loose and rattling under tyres.",
        "Vehicle scratch incident in tight parking bay lacking camera coverage."
    ],
    "Noise & Disturbance": [
        "Extremely loud party music and heavy subwoofer bass late after midnight.",
        "Heavy hammer drilling and demolition noise during Sunday quiet hours.",
        "Dog barking incessantly on balcony for past four hours without pause.",
        "Children playing loud corridor cricket and hitting balls against flat doors.",
        "Loud domestic altercation and screaming heard in common corridor.",
        "Commercial fitness training with loud music in residential flat at 6 AM.",
        "Diesel generator test running past permitted evening quiet hours.",
        "Loud motorcycle engine revving repeatedly inside basement parking.",
        "Loud television audio blasting through open balcony doors late at night.",
        "Furniture dragging and dropping heavy weights on floor above bedroom.",
        "Musical instrument drumming practice echoing through building duct.",
        "Party guests shouting and talking loudly in common lobby past 1 AM.",
        "Air conditioner compressor vibration buzzing through bedroom wall.",
        "High decibel exhaust chimney sound from ground floor commercial kitchen.",
        "Construction workers shouting in stairwell early morning before 7 AM.",
        "Vehicle horn honking unnecessarily at main gate late at night.",
        "Loud vacuum cleaner operation in corridor during early morning hours.",
        "Skateboarding noise on common terrace tiles directly above flat.",
        "Loud speakerphone conversation on speaker in corridor outside door.",
        "Pet bird screeching loudly on balcony disrupting remote office work."
    ],
    "Structural & Common Area": [
        "Rainwater seepage and paint blistering across living room ceiling.",
        "Corridor floor vitrified tile cracked and rocking loose underfoot.",
        "Terrace parapet wall has widening diagonal cracks needing structural check.",
        "Clubhouse swimming pool timber decking warped with protruding nails.",
        "Children playground fiberglass slide has sharp cracked jagged edge.",
        "Heavy frameless glass entrance door to clubhouse dragging on floor.",
        "Exterior wall plaster falling in chunks onto podium garden pathway.",
        "Basement retaining wall showing signs of active dampness and efflorescence.",
        "Expansion joint seal between Tower A and Tower B deteriorated and leaking.",
        "Balcony railing iron welding rusted and feeling unstable when leant on.",
        "Terrace waterproofing membrane punctured causing water leaks below.",
        "Gymnasium wooden flooring warped due to water seepage.",
        "Staircase concrete steps chipped at edge creating serious fall risk.",
        "False ceiling gypsum board sagging dangerously in entrance lobby.",
        "Corridor wall plaster peeling off due to damp pipe shaft.",
        "Clubhouse gazebo roof tiles displaced by recent storm winds.",
        "Badminton court wooden flooring uneven and bouncing hollow.",
        "Basement pillar concrete spalling with visible rusted rebar.",
        "Terrace access fire door frame warped and refusing to latch shut.",
        "Podium landscaping planter wall cracked and soil spilling onto walkway."
    ]
}

def generate_balanced():
    os.makedirs('ml-service/data', exist_ok=True)
    csv_path = 'ml-service/data/apartment_complaints.csv'
    total = 0
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['title', 'description', 'category'])
        for cat, samples in TEMPLATES.items():
            for desc in samples:
                # Split description into title + detail
                title = desc.split('.')[0]
                writer.writerow([title, desc, cat])
                total += 1
    print(f"Generated balanced dataset with {total} samples (20 per class) at {csv_path}")

if __name__ == '__main__':
    generate_balanced()
