export type Region = 'Central' | 'East' | 'West' | 'North' | 'North-East' | 'Islandwide';
export type CommunityCategory =
  | 'Public programme'
  | 'Competitive community'
  | 'Alumni community'
  | 'Private club'
  | 'Social group'
  | 'Coaching academy';
export type AccessType = 'Public' | 'Eligibility-based' | 'Members' | 'Guests welcome';
export type PlayerLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Competitive';
export type VerificationStatus = 'Unverified' | 'Organizer verified' | 'Needs re-checking';

export interface CommunityContact {
  label: string;
  href: string;
  kind: 'website' | 'email' | 'phone' | 'form' | 'community';
}

export interface CommunitySource {
  label: string;
  url: string;
}

export interface Community {
  slug: string;
  name: string;
  shortName: string;
  category: CommunityCategory;
  region: Region;
  neighbourhood: string;
  address: string;
  suitableFor: string;
  description: string;
  accessType: AccessType;
  eligibility: string;
  accessSummary: string;
  levels: PlayerLevel[];
  courtCount: string;
  socialPlay: string;
  trainingAvailable: boolean;
  trainingIntensity: 'Social' | 'Moderate' | 'Structured' | 'Competitive';
  trainingSummary: string;
  joiningFee: string;
  recurringFee: string;
  courtFee: string;
  guestFee: string;
  indicativeCost: string;
  joiningSteps: string[];
  contacts: CommunityContact[];
  sources: CommunitySource[];
  lastChecked: string;
  verificationStatus: VerificationStatus;
  note?: string;
}

const notListed = 'Not publicly listed—contact organizer';

export const communities: Community[] = [
  {
    slug: 'safra-squash-club',
    name: 'SAFRA Squash Club',
    shortName: 'SAFRA',
    category: 'Competitive community',
    region: 'Central',
    neighbourhood: 'Toa Payoh',
    address: 'SAFRA Toa Payoh, 293 Lorong 6 Toa Payoh, Singapore 319387',
    suitableFor: 'Players who want regular training, competitive matches, and a broad range of playing levels.',
    description: 'An established competitive sports club with training blocks at SAFRA Toa Payoh and a stated welcome for players of all ages, genders, and experience levels.',
    accessType: 'Eligibility-based',
    eligibility: 'SAFRA membership eligibility applies for court booking; contact the club about sports-club participation.',
    accessSummary: 'SAFRA eligibility applies',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: '2 courts referenced in regular training closures',
    socialPlay: 'Community play and competitive matches are part of the club offering; current session details should be confirmed.',
    trainingAvailable: true,
    trainingIntensity: 'Competitive',
    trainingSummary: 'Regular training blocks are listed on Monday, Wednesday, and Friday evenings.',
    joiningFee: notListed,
    recurringFee: notListed,
    courtFee: '$3.30/hr off-peak or $6.20/hr peak for SAFRA members',
    guestFee: notListed,
    indicativeCost: 'Court from $3.30/hr; club fee not listed',
    joiningSteps: ['Check SAFRA membership eligibility.', 'Email the Toa Payoh club team.', 'Ask about the next training intake and current section fees.'],
    contacts: [
      { label: 'Email the club', href: 'mailto:tpclub@safra.sg?subject=SAFRA%20Squash%20Club%20enquiry', kind: 'email' },
      { label: 'Club information', href: 'https://www.safra.sg/interest-groups/competitive-sports-clubs', kind: 'website' },
    ],
    sources: [
      { label: 'SAFRA Competitive Sports Clubs', url: 'https://www.safra.sg/interest-groups/competitive-sports-clubs' },
      { label: 'SAFRA squash courts and rates', url: 'https://sfadmin.safra.sg/whats-on/indoor-squash-courts' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'activesg-sport-interest-groups',
    name: 'ActiveSG Squash Interest Groups',
    shortName: 'ActiveSG',
    category: 'Public programme',
    region: 'Islandwide',
    neighbourhood: 'Participating ActiveSG centres',
    address: 'Locations vary by programme intake',
    suitableFor: 'Players seeking a low-cost, recurring group without joining a private club.',
    description: 'A public programme designed to gather sports enthusiasts for regular weekly sessions. Availability and venue depend on the current MyActiveSG+ intake.',
    accessType: 'Public',
    eligibility: 'Open to registered and verified ActiveSG members; participants under 18 require guardian consent.',
    accessSummary: 'Open to ActiveSG members',
    levels: ['Beginner', 'Intermediate'],
    courtCount: 'Up to 5 participants per squash court',
    socialPlay: 'Four once-a-week, two-hour group sessions per programme cycle.',
    trainingAvailable: false,
    trainingIntensity: 'Social',
    trainingSummary: 'Facilitated group play rather than advertised performance coaching.',
    joiningFee: '$0 ActiveSG account registration',
    recurringFee: '$8 off-peak or $16 peak for four squash sessions',
    courtFee: 'Included in programme pricing',
    guestFee: 'Participants register individually',
    indicativeCost: '$8–$16 for four sessions',
    joiningSteps: ['Create or verify an ActiveSG account.', 'Search MyActiveSG+ for a current Squash Interest Group.', 'Register for an available four-session cycle.'],
    contacts: [
      { label: 'View programme guide', href: 'https://www.activesgcircle.gov.sg/learn/active-interest-groups', kind: 'website' },
      { label: 'Open ActiveSG', href: 'https://activesg.gov.sg/', kind: 'website' },
    ],
    sources: [{ label: 'ActiveSG Sport Interest Groups', url: 'https://www.activesgcircle.gov.sg/learn/active-interest-groups' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
    note: 'Programme availability changes by intake; confirm the current venue before planning travel.',
  },
  {
    slug: 'nuss-squash-section',
    name: 'NUSS Squash Section',
    shortName: 'NUSS',
    category: 'Alumni community',
    region: 'West',
    neighbourhood: 'Kent Ridge',
    address: 'Kent Ridge Guild House, 9 Kent Ridge Drive, Singapore 119241',
    suitableFor: 'NUS graduates who want a natural bridge from campus squash into an alumni community.',
    description: 'A long-running alumni squash section that organizes regular section games, tournaments, and sanctioned competitive play at Kent Ridge Guild House.',
    accessType: 'Eligibility-based',
    eligibility: 'NUSS membership is required; NUSS membership categories and eligibility apply.',
    accessSummary: 'NUSS membership required',
    levels: ['Intermediate', 'Advanced', 'Competitive'],
    courtCount: '2 courts at Kent Ridge Guild House',
    socialPlay: 'Section games Monday and Thursday, 4pm–10pm, and Saturday, 2pm–6pm.',
    trainingAvailable: true,
    trainingIntensity: 'Competitive',
    trainingSummary: 'Competitive play, leagues, fixtures, and section activities; coaching details are not publicly listed.',
    joiningFee: 'NUSS membership cost depends on membership category',
    recurringFee: '$43.60 section fee; billing period is not stated on the public page',
    courtFee: notListed,
    guestFee: notListed,
    indicativeCost: '$43.60 section fee plus NUSS membership',
    joiningSteps: ['Confirm eligibility for a NUSS membership category.', 'Apply for NUSS membership if needed.', 'Use the squash section joining form or contact Sports & Events.'],
    contacts: [
      { label: 'Join the section', href: 'https://www.nuss.org.sg/sports-recreation/squash/', kind: 'form' },
      { label: 'Email Sports & Events', href: 'mailto:sports@nuss.org.sg?subject=NUSS%20Squash%20Section%20enquiry', kind: 'email' },
    ],
    sources: [
      { label: 'NUSS Squash Section', url: 'https://www.nuss.org.sg/sports-recreation/squash/' },
      { label: 'NUSS facilities', url: 'https://www.nuss.org.sg/our-guild-houses/our-facilities/' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'british-club-squash',
    name: 'The British Club Squash Section',
    shortName: 'British Club',
    category: 'Private club',
    region: 'Central',
    neighbourhood: 'Bukit Timah',
    address: '73 Bukit Tinggi Road, Singapore 289761',
    suitableFor: 'Players who want a well-equipped private-club environment with both social and competitive squash.',
    description: 'A member-run section with four courts, regular social and competitive play, ladders, friendly matches, tours, and coaching.',
    accessType: 'Members',
    eligibility: 'British Club membership is required to join the squash section; members may bring guests subject to fees and rules.',
    accessSummary: 'Club membership required',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: '4 courts, including 2 glass-back courts',
    socialPlay: 'Member-run social squash, ladders, handicap events, friendlies, leagues, and tours.',
    trainingAvailable: true,
    trainingIntensity: 'Structured',
    trainingSummary: 'Private and semi-private coaching is publicly listed alongside section activities.',
    joiningFee: 'British Club membership cost varies by category',
    recurringFee: '$12+ per month for the squash section',
    courtFee: '$5+ to $7+ per court per hour',
    guestFee: '$5+ per guest, in addition to court fee',
    indicativeCost: '$12+/month plus club membership and court fees',
    joiningSteps: ['Review British Club membership options.', 'Become a club member.', 'Submit the squash section joining form.'],
    contacts: [
      { label: 'Squash section page', href: 'https://www.britishclub.org.sg/sports/squash/', kind: 'website' },
      { label: 'Email the squash section', href: 'mailto:squash@britishclub.org.sg?subject=Squash%20section%20enquiry', kind: 'email' },
    ],
    sources: [{ label: 'The British Club Squash', url: 'https://www.britishclub.org.sg/sports/squash/' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'tanglin-club-squash',
    name: 'Tanglin Club Squash Section',
    shortName: 'Tanglin Club',
    category: 'Private club',
    region: 'Central',
    neighbourhood: 'Orchard / Stevens',
    address: '5 Stevens Road, Singapore 257814',
    suitableFor: 'Members looking for frequent socials, singles and doubles, and established inter-club competition.',
    description: 'One of Singapore’s larger private squash facilities, with six singles courts, two doubles courts, three weekly socials, a handicap event, and coaching.',
    accessType: 'Members',
    eligibility: 'Tanglin Club membership and squash section registration are required; section activities do not allow guests.',
    accessSummary: 'Members only for section activities',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: '6 singles courts and 2 doubles courts',
    socialPlay: 'Tuesday and Thursday evenings, Saturday afternoons, plus a Tuesday handicap tournament.',
    trainingAvailable: true,
    trainingIntensity: 'Structured',
    trainingSummary: 'Individual and group coaching is available on request.',
    joiningFee: 'Tanglin Club membership cost varies by category',
    recurringFee: '$5 per month for an adult squash section member',
    courtFee: notListed,
    guestFee: 'No guests at section activities',
    indicativeCost: '$5/month section fee plus club membership',
    joiningSteps: ['Confirm Tanglin Club membership.', 'Request the squash section registration form from Sports & Recreation.', 'Attend a listed social or handicap session after registration.'],
    contacts: [
      { label: 'Section information', href: 'https://tanglinclub.org.sg/sports/squash-section.html', kind: 'website' },
      { label: 'Email Sports & Recreation', href: 'mailto:sports@tanglinclub.org?subject=Squash%20section%20enquiry', kind: 'email' },
    ],
    sources: [{ label: 'Tanglin Club Squash Section', url: 'https://tanglinclub.org.sg/sports/squash-section.html' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'singapore-cricket-club-squash',
    name: 'Singapore Cricket Club Squash Section',
    shortName: 'SCC',
    category: 'Private club',
    region: 'Central',
    neighbourhood: 'City Hall / Padang',
    address: 'Connaught Drive, Singapore 179681',
    suitableFor: 'Competitive adults who value regular club nights, league teams, and a central location.',
    description: 'A competitive private-club section with two air-conditioned courts, men’s and ladies’ club nights, league participation, and junior coaching.',
    accessType: 'Members',
    eligibility: 'SCC membership is required; squash section members make bookings and may host guests within club rules.',
    accessSummary: 'SCC membership required',
    levels: ['Intermediate', 'Advanced', 'Competitive'],
    courtCount: '2 air-conditioned courts',
    socialPlay: 'Ladies’ nights Monday and Wednesday; men’s nights Tuesday and Thursday.',
    trainingAvailable: true,
    trainingIntensity: 'Competitive',
    trainingSummary: 'Regular section nights, National Squash League teams, and Saturday junior coaching.',
    joiningFee: 'SCC membership cost varies by category',
    recurringFee: '$9/month squash section fee shown on the March 2026 sports membership form',
    courtFee: '$5 off-peak or $10 peak per hour for section members',
    guestFee: '$6.50 off-peak or $13 peak per hour',
    indicativeCost: '$9/month section fee plus membership and court fees',
    joiningSteps: ['Review SCC sports membership requirements.', 'Apply for SCC membership and select the squash section.', 'Use the section form to express interest in club activities.'],
    contacts: [
      { label: 'Squash section page', href: 'https://scc.org.sg/sport/squash/', kind: 'website' },
      { label: 'General enquiry', href: 'mailto:scc@scc.org.sg?subject=Squash%20section%20enquiry', kind: 'email' },
    ],
    sources: [
      { label: 'SCC Squash Section', url: 'https://scc.org.sg/sport/squash/' },
      { label: 'SCC Sports Membership Form, March 2026', url: 'https://scc.org.sg/wp-content/uploads/Membership/2026/SCC-Sports-Membership-Application-Form-MARCH-2026.pdf' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'hollandse-club-squash',
    name: 'Hollandse Club Squash Community',
    shortName: 'Hollandse Club',
    category: 'Private club',
    region: 'Central',
    neighbourhood: 'Bukit Timah',
    address: '22 Camden Park, Singapore 299814',
    suitableFor: 'Members seeking a friendly, inclusive weekly social with affordable court fees.',
    description: 'An active member community with two glass-back courts, weekly free socials, friendlies, and guest access when hosted by a member.',
    accessType: 'Guests welcome',
    eligibility: 'Only Hollandse Club members can book; non-members may play as guests of a member.',
    accessSummary: 'Guests can play with a member',
    levels: ['Beginner', 'Intermediate', 'Advanced'],
    courtCount: '2 glass-back courts',
    socialPlay: 'Weekly free squash socials for club members and regular friendlies.',
    trainingAvailable: false,
    trainingIntensity: 'Social',
    trainingSummary: 'The public squash page emphasizes socials rather than structured adult coaching.',
    joiningFee: 'Hollandse Club membership cost varies by category',
    recurringFee: 'Weekly member socials are advertised as free',
    courtFee: '$3.70 per hour',
    guestFee: '$10 weekdays or $15 weekends',
    indicativeCost: '$3.70/hr for members; guests $10–$15',
    joiningSteps: ['Join the Hollandse Club or arrange to play with a member.', 'Contact reception for current social details.', 'Members book courts through GameTime.'],
    contacts: [
      { label: 'Squash community page', href: 'https://www.hollandseclub.org.sg/squash', kind: 'website' },
      { label: 'Email reception', href: 'mailto:reception@hollandseclub.org.sg?subject=Squash%20enquiry', kind: 'email' },
    ],
    sources: [{ label: 'Hollandse Club Squash', url: 'https://www.hollandseclub.org.sg/squash' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'singapore-swimming-club-squash',
    name: 'Singapore Swimming Club Squash',
    shortName: 'Swimming Club',
    category: 'Private club',
    region: 'East',
    neighbourhood: 'Tanjong Rhu',
    address: '45 Tanjong Rhu Road, Singapore 436899',
    suitableFor: 'East-side members who want frequent club sessions and access to four competition-standard courts.',
    description: 'A member club with four courts and reserved squash club sessions on Tuesday, Thursday, and Saturday.',
    accessType: 'Guests welcome',
    eligibility: 'Club membership is required for booking; members may host guests subject to fees and club rules.',
    accessSummary: 'Members book; guests pay a fee',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: '4 competition-standard courts',
    socialPlay: 'Club sessions Tuesday and Thursday, 5pm–10pm, and Saturday, 3pm–7pm.',
    trainingAvailable: true,
    trainingIntensity: 'Structured',
    trainingSummary: 'Coaching classes are offered; current class schedule and eligibility should be confirmed.',
    joiningFee: 'Club membership cost varies by category',
    recurringFee: '$3 per member per club-session day',
    courtFee: '$5.50/hr off-peak or $8/hr peak',
    guestFee: '$8/hr',
    indicativeCost: '$3 club session or $5.50–$8/hr court',
    joiningSteps: ['Review Singapore Swimming Club membership.', 'Contact the sports team about joining club sessions.', 'Book courts through the member system after joining.'],
    contacts: [{ label: 'Squash court information', href: 'https://sswimclub.org.sg/sport-facility/squash-courts/', kind: 'website' }],
    sources: [{ label: 'Singapore Swimming Club Squash Courts', url: 'https://sswimclub.org.sg/sport-facility/squash-courts/' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'chinese-swimming-club-squash',
    name: 'Chinese Swimming Club Squash Section',
    shortName: 'CSC',
    category: 'Private club',
    region: 'East',
    neighbourhood: 'Amber / Katong',
    address: '21 & 34 Amber Road, Singapore 439870',
    suitableFor: 'East-side members who want three training nights each week and low section fees.',
    description: 'A club section with thrice-weekly training, court access, and links to coaching programmes for adults and juniors.',
    accessType: 'Members',
    eligibility: 'Chinese Swimming Club membership is required for section membership; selected coaching programmes accept guests.',
    accessSummary: 'Club membership required',
    levels: ['Intermediate', 'Advanced', 'Competitive'],
    courtCount: '2 courts shown in facility schedules',
    socialPlay: 'Section training Monday, Wednesday, and Friday evenings.',
    trainingAvailable: true,
    trainingIntensity: 'Competitive',
    trainingSummary: 'Thrice-weekly section training with courts and balls provided.',
    joiningFee: 'Club membership cost varies by category',
    recurringFee: '$10.90/month squash section membership',
    courtFee: '$4.36/hr off-peak or $5.45/hr peak',
    guestFee: 'Varies by programme',
    indicativeCost: '$10.90/month section fee plus club membership',
    joiningSteps: ['Confirm Chinese Swimming Club membership.', 'Use the section registration form.', 'Contact Sports Reception for the next training session.'],
    contacts: [
      { label: 'Programmes and registration', href: 'https://www.chineseswimmingclub.org.sg/sports/squash/programmes/', kind: 'form' },
      { label: 'Email programme contact', href: 'mailto:Jasmine_Tan@chineseswimmingclub.org.sg?subject=Squash%20programme%20enquiry', kind: 'email' },
    ],
    sources: [
      { label: 'CSC Squash Programmes', url: 'https://www.chineseswimmingclub.org.sg/sports/squash/programmes/' },
      { label: 'CSC Squash Facilities', url: 'https://www.chineseswimmingclub.org.sg/sports/squash/facilities/' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'ultimate-squasher',
    name: 'Team Ultimate Squasher',
    shortName: 'Ultimate Squasher',
    category: 'Coaching academy',
    region: 'East',
    neighbourhood: 'Kallang and partner venues',
    address: 'Training venues vary by programme',
    suitableFor: 'Adults or juniors who prioritize structured improvement from accredited coaches.',
    description: 'A Singapore coaching team offering training from beginner to elite level, including adult groups, junior programmes, and private coaching.',
    accessType: 'Public',
    eligibility: 'Programme-specific age and minimum-participant requirements apply; guest places are available for selected programmes.',
    accessSummary: 'Public enrolment by programme',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: 'Multiple partner venues',
    socialPlay: 'Primarily coaching-led; ask about match play and community sessions for your level.',
    trainingAvailable: true,
    trainingIntensity: 'Structured',
    trainingSummary: 'WSF-accredited coaches support beginners through elite and representative players.',
    joiningFee: '$0; enrol by programme',
    recurringFee: notListed,
    courtFee: 'May be bundled or charged separately by programme',
    guestFee: 'Included for selected Chinese Swimming Club programmes',
    indicativeCost: 'Programme pricing on enquiry',
    joiningSteps: ['Review the current term schedule.', 'Submit an enrolment or trial-session enquiry.', 'Confirm venue, level, fees, and whether court charges are included.'],
    contacts: [
      { label: 'Academy website', href: 'https://www.ultimatesquasher.com/', kind: 'website' },
      { label: 'Email the academy', href: 'mailto:ultimatesquasher@gmail.com?subject=Adult%20squash%20training%20enquiry', kind: 'email' },
    ],
    sources: [
      { label: 'Ultimate Squasher', url: 'https://www.ultimatesquasher.com/' },
      { label: 'CSC adult group programme', url: 'https://www.chineseswimmingclub.org.sg/sports/squash/programmes/' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'american-club-squash',
    name: 'The American Club Squash Community',
    shortName: 'American Club',
    category: 'Private club',
    region: 'Central',
    neighbourhood: 'Orchard',
    address: '10 Claymore Hill, Singapore 229573',
    suitableFor: 'Members wanting regular all-level socials, ladders, tournaments, and coaching in Orchard.',
    description: 'A private-club squash community with two courts, three weekly social blocks, box ladders, tournaments, leagues, and lessons.',
    accessType: 'Guests welcome',
    eligibility: 'Activities are open to club members; guests must be accompanied by a member and pay the applicable fee.',
    accessSummary: 'Members; accompanied guests allowed',
    levels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    courtCount: '2 courts',
    socialPlay: 'Tuesday and Thursday evenings and Saturday mornings; all levels are encouraged to join.',
    trainingAvailable: true,
    trainingIntensity: 'Structured',
    trainingSummary: 'Group and private lessons are available, alongside ladders and inter-club leagues.',
    joiningFee: 'Club membership pricing is provided by Membership Services',
    recurringFee: notListed,
    courtFee: notListed,
    guestFee: 'Applicable fee; amount not publicly listed on the squash page',
    indicativeCost: 'Contact Membership Services for current pricing',
    joiningSteps: ['Review American Club membership eligibility and pricing.', 'Join the club or arrange a member-hosted guest visit.', 'Contact the Sports Center for current squash socials.'],
    contacts: [
      { label: 'Squash page', href: 'https://amclub.org.sg/fitness/squash', kind: 'website' },
      { label: 'Email Sports Center', href: 'mailto:sportscenter@amclub.org.sg?subject=Squash%20community%20enquiry', kind: 'email' },
    ],
    sources: [{ label: 'The American Club Squash', url: 'https://amclub.org.sg/fitness/squash' }],
    lastChecked: '2026-08-29',
    verificationStatus: 'Unverified',
  },
  {
    slug: 'cookie-squash-club',
    name: 'Cookie Squash Club',
    shortName: 'Cookie Squash',
    category: 'Social group',
    region: 'West',
    neighbourhood: 'Blackmore Drive / Bukit Timah',
    address: '11 Blackmore Drive, Singapore 599986',
    suitableFor: 'Players who want a large, friendly social group with recurring sessions and mixed playing levels.',
    description: 'An SSRA-listed community with an organizer-run Meetup presence and recurring social sessions. Details should be reconfirmed with the organizer before attending.',
    accessType: 'Public',
    eligibility: 'The community describes itself as welcoming all skill levels; current session approval rules are managed through Meetup.',
    accessSummary: 'Join or request a session on Meetup',
    levels: ['Beginner', 'Intermediate', 'Advanced'],
    courtCount: '4 courts were previously associated with the Blackmore Drive venue',
    socialPlay: 'Organizer listings show recurring social sessions across several days.',
    trainingAvailable: false,
    trainingIntensity: 'Social',
    trainingSummary: 'Social match play is emphasized; structured coaching is not publicly documented.',
    joiningFee: notListed,
    recurringFee: notListed,
    courtFee: notListed,
    guestFee: notListed,
    indicativeCost: 'Session price not publicly listed',
    joiningSteps: ['Open the organizer-managed Meetup group.', 'Review a current session’s venue, fee, and level guidance.', 'Join or request a place through the event page.'],
    contacts: [{ label: 'Find current Meetup sessions', href: 'https://www.meetup.com/topics/squash/sg/singapore/', kind: 'community' }],
    sources: [
      { label: 'Singapore Squash affiliated clubs report', url: 'https://sgsquash.com/wp-content/uploads/2024/09/Singapore-Squash-Annual-Report-2024-Amended-pg-51.pdf' },
      { label: 'Singapore squash Meetup directory', url: 'https://www.meetup.com/topics/squash/sg/singapore/' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Needs re-checking',
    note: 'The club has not verified this listing. Session venue, fee, and frequency may change.',
  },
  {
    slug: 'serangoon-gardens-country-club-squash',
    name: 'Serangoon Gardens Country Club Squash',
    shortName: 'SGCC',
    category: 'Private club',
    region: 'North-East',
    neighbourhood: 'Serangoon Gardens',
    address: '22 Kensington Park Road, Singapore 557271',
    suitableFor: 'North-east residents exploring a neighbourhood private club with recurring squash socials.',
    description: 'A private country club with squash facilities and recurring social nights referenced in current club calendars.',
    accessType: 'Members',
    eligibility: 'Club membership is required; current squash section joining rules are not publicly detailed.',
    accessSummary: 'Club membership required',
    levels: ['Intermediate', 'Advanced'],
    courtCount: notListed,
    socialPlay: 'Club calendars reference squash social nights; confirm the current weekly schedule.',
    trainingAvailable: false,
    trainingIntensity: 'Social',
    trainingSummary: notListed,
    joiningFee: 'Club membership cost varies by category',
    recurringFee: notListed,
    courtFee: notListed,
    guestFee: notListed,
    indicativeCost: 'Contact the club for current squash fees',
    joiningSteps: ['Contact the club about membership eligibility.', 'Ask for the current squash social schedule and section cost.', 'Complete club and section registration before attending.'],
    contacts: [{ label: 'Club facilities page', href: 'https://sgcc.com.sg/facilities/', kind: 'website' }],
    sources: [
      { label: 'SGCC Facilities', url: 'https://sgcc.com.sg/facilities/' },
      { label: 'Singapore Squash affiliated clubs report', url: 'https://sgsquash.com/wp-content/uploads/2024/09/Singapore-Squash-Annual-Report-2024-Amended-pg-51.pdf' },
    ],
    lastChecked: '2026-08-29',
    verificationStatus: 'Needs re-checking',
  },
];

const allowedStatuses = new Set<VerificationStatus>(['Unverified', 'Organizer verified', 'Needs re-checking']);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function assertEditorialData(records: Community[]) {
  const slugs = new Set<string>();
  for (const record of records) {
    if (!record.slug || slugs.has(record.slug)) throw new Error(`Duplicate or missing community slug: ${record.slug}`);
    slugs.add(record.slug);
    if (!allowedStatuses.has(record.verificationStatus)) throw new Error(`Unsupported status for ${record.slug}`);
    if (!isoDate.test(record.lastChecked) || Number.isNaN(Date.parse(record.lastChecked))) throw new Error(`Malformed date for ${record.slug}`);
    if (record.sources.length === 0) throw new Error(`Missing source attribution for ${record.slug}`);
    for (const source of record.sources) new URL(source.url);
    for (const contact of record.contacts) {
      if (!/^(https?:|mailto:|tel:)/.test(contact.href)) throw new Error(`Invalid contact URL for ${record.slug}`);
    }
  }
}

assertEditorialData(communities);

export function getCommunity(slug: string) {
  return communities.find((community) => community.slug === slug);
}

export const communityCount = communities.length;
export { notListed };
