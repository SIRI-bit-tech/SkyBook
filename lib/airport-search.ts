import fs from 'fs';
import path from 'path';

export interface Airport {
  id: number;
  name: string;
  city: string;
  country: string;
  region: string;
  regionCode: string;
  iataCode: string;
  icaoCode: string;
  latitude: number;
  longitude: number;
  altitude: number;
  continent: string;
  type: string;
  source: string;
}

export interface AirportSearchResult {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  regionCode?: string;
  type: string;
  displayName: string;
  fullName: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

class AirportSearchService {
  private airports: Airport[] = [];
  private initialized = false;

  private async loadAirports(): Promise<void> {
    if (this.initialized) return;

    try {
      const filePath = path.join(process.cwd(), 'public', 'airports-with-regions.csv');
      const csvData = fs.readFileSync(filePath, 'utf-8');
      
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = this.parseCSVLine(lines[0]);
      
      // Validate required columns exist
      const requiredColumns = ['id', 'name', 'municipality', 'iso_country', 'iso_region', 'iata_code', 'latitude_deg', 'longitude_deg'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required CSV columns: ${missingColumns.join(', ')}`);
      }
      
      // Find column indices
      const idIndex = headers.indexOf('id');
      const nameIndex = headers.indexOf('name');
      const municipalityIndex = headers.indexOf('municipality');
      const isoCountryIndex = headers.indexOf('iso_country');
      const isoRegionIndex = headers.indexOf('iso_region');
      const iataIndex = headers.indexOf('iata_code');
      const icaoIndex = headers.indexOf('icao_code');
      const latIndex = headers.indexOf('latitude_deg');
      const lonIndex = headers.indexOf('longitude_deg');
      const elevationIndex = headers.indexOf('elevation_ft');
      const continentIndex = headers.indexOf('continent');
      const typeIndex = headers.indexOf('type');
      
      this.airports = lines
        .slice(1) // Skip header row
        .map(line => {
          const fields = this.parseCSVLine(line);
          
          if (fields.length < headers.length) return null;
          
          const iataCode = fields[iataIndex]?.replace(/"/g, '').trim();
          const icaoCode = fields[icaoIndex]?.replace(/"/g, '').trim();
          
          // Only include airports with valid IATA codes
          if (!iataCode || iataCode.length !== 3) {
            return null;
          }

          const regionCode = fields[isoRegionIndex]?.replace(/"/g, '').trim() || '';
          const region = this.parseRegionName(regionCode);

          return {
            id: parseInt(fields[idIndex]) || 0,
            name: fields[nameIndex]?.replace(/"/g, '').trim() || '',
            city: fields[municipalityIndex]?.replace(/"/g, '').trim() || '',
            country: this.parseCountryName(fields[isoCountryIndex]?.replace(/"/g, '').trim() || ''),
            region,
            regionCode,
            iataCode,
            icaoCode: icaoCode || '',
            latitude: parseFloat(fields[latIndex]) || 0,
            longitude: parseFloat(fields[lonIndex]) || 0,
            altitude: parseInt(fields[elevationIndex]) || 0,
            continent: fields[continentIndex]?.replace(/"/g, '').trim() || '',
            type: fields[typeIndex]?.replace(/"/g, '').trim() || 'airport',
            source: 'OurAirports',
          };
        })
        .filter((airport): airport is Airport => airport !== null);

      console.log(`Loaded ${this.airports.length} airports from OurAirports database`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load airports database:', error);
      this.airports = [];
      this.initialized = true;
    }
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quote ("" inside quoted field)
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle inQuotes when entering/exiting quoted sections
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current); // Add the last field
    return fields;
  }

  private parseCountryName(isoCode: string): string {
    const countryMap: { [key: string]: string } = {
      // A
      'AD': 'Andorra', 'AE': 'United Arab Emirates', 'AF': 'Afghanistan', 'AG': 'Antigua and Barbuda',
      'AI': 'Anguilla', 'AL': 'Albania', 'AM': 'Armenia', 'AO': 'Angola', 'AQ': 'Antarctica',
      'AR': 'Argentina', 'AS': 'American Samoa', 'AT': 'Austria', 'AU': 'Australia', 'AW': 'Aruba',
      'AX': 'Åland Islands', 'AZ': 'Azerbaijan',
      
      // B
      'BA': 'Bosnia and Herzegovina', 'BB': 'Barbados', 'BD': 'Bangladesh', 'BE': 'Belgium',
      'BF': 'Burkina Faso', 'BG': 'Bulgaria', 'BH': 'Bahrain', 'BI': 'Burundi', 'BJ': 'Benin',
      'BL': 'Saint Barthélemy', 'BM': 'Bermuda', 'BN': 'Brunei', 'BO': 'Bolivia', 'BQ': 'Caribbean Netherlands',
      'BR': 'Brazil', 'BS': 'Bahamas', 'BT': 'Bhutan', 'BV': 'Bouvet Island', 'BW': 'Botswana',
      'BY': 'Belarus', 'BZ': 'Belize',
      
      // C
      'CA': 'Canada', 'CC': 'Cocos Islands', 'CD': 'Democratic Republic of the Congo', 'CF': 'Central African Republic',
      'CG': 'Republic of the Congo', 'CH': 'Switzerland', 'CI': 'Côte d\'Ivoire', 'CK': 'Cook Islands',
      'CL': 'Chile', 'CM': 'Cameroon', 'CN': 'China', 'CO': 'Colombia', 'CR': 'Costa Rica',
      'CU': 'Cuba', 'CV': 'Cape Verde', 'CW': 'Curaçao', 'CX': 'Christmas Island', 'CY': 'Cyprus',
      'CZ': 'Czech Republic',
      
      // D
      'DE': 'Germany', 'DJ': 'Djibouti', 'DK': 'Denmark', 'DM': 'Dominica', 'DO': 'Dominican Republic',
      'DZ': 'Algeria',
      
      // E
      'EC': 'Ecuador', 'EE': 'Estonia', 'EG': 'Egypt', 'EH': 'Western Sahara', 'ER': 'Eritrea',
      'ES': 'Spain', 'ET': 'Ethiopia',
      
      // F
      'FI': 'Finland', 'FJ': 'Fiji', 'FK': 'Falkland Islands', 'FM': 'Micronesia', 'FO': 'Faroe Islands',
      'FR': 'France',
      
      // G
      'GA': 'Gabon', 'GB': 'United Kingdom', 'GD': 'Grenada', 'GE': 'Georgia', 'GF': 'French Guiana',
      'GG': 'Guernsey', 'GH': 'Ghana', 'GI': 'Gibraltar', 'GL': 'Greenland', 'GM': 'Gambia',
      'GN': 'Guinea', 'GP': 'Guadeloupe', 'GQ': 'Equatorial Guinea', 'GR': 'Greece', 'GS': 'South Georgia',
      'GT': 'Guatemala', 'GU': 'Guam', 'GW': 'Guinea-Bissau', 'GY': 'Guyana',
      
      // H
      'HK': 'Hong Kong', 'HM': 'Heard Island', 'HN': 'Honduras', 'HR': 'Croatia', 'HT': 'Haiti',
      'HU': 'Hungary',
      
      // I
      'ID': 'Indonesia', 'IE': 'Ireland', 'IL': 'Israel', 'IM': 'Isle of Man', 'IN': 'India',
      'IO': 'British Indian Ocean Territory', 'IQ': 'Iraq', 'IR': 'Iran', 'IS': 'Iceland', 'IT': 'Italy',
      
      // J
      'JE': 'Jersey', 'JM': 'Jamaica', 'JO': 'Jordan', 'JP': 'Japan',
      
      // K
      'KE': 'Kenya', 'KG': 'Kyrgyzstan', 'KH': 'Cambodia', 'KI': 'Kiribati', 'KM': 'Comoros',
      'KN': 'Saint Kitts and Nevis', 'KP': 'North Korea', 'KR': 'South Korea', 'KW': 'Kuwait',
      'KY': 'Cayman Islands', 'KZ': 'Kazakhstan',
      
      // L
      'LA': 'Laos', 'LB': 'Lebanon', 'LC': 'Saint Lucia', 'LI': 'Liechtenstein', 'LK': 'Sri Lanka',
      'LR': 'Liberia', 'LS': 'Lesotho', 'LT': 'Lithuania', 'LU': 'Luxembourg', 'LV': 'Latvia',
      'LY': 'Libya',
      
      // M
      'MA': 'Morocco', 'MC': 'Monaco', 'MD': 'Moldova', 'ME': 'Montenegro', 'MF': 'Saint Martin',
      'MG': 'Madagascar', 'MH': 'Marshall Islands', 'MK': 'North Macedonia', 'ML': 'Mali', 'MM': 'Myanmar',
      'MN': 'Mongolia', 'MO': 'Macao', 'MP': 'Northern Mariana Islands', 'MQ': 'Martinique', 'MR': 'Mauritania',
      'MS': 'Montserrat', 'MT': 'Malta', 'MU': 'Mauritius', 'MV': 'Maldives', 'MW': 'Malawi',
      'MX': 'Mexico', 'MY': 'Malaysia', 'MZ': 'Mozambique',
      
      // N
      'NA': 'Namibia', 'NC': 'New Caledonia', 'NE': 'Niger', 'NF': 'Norfolk Island', 'NG': 'Nigeria',
      'NI': 'Nicaragua', 'NL': 'Netherlands', 'NO': 'Norway', 'NP': 'Nepal', 'NR': 'Nauru',
      'NU': 'Niue', 'NZ': 'New Zealand',
      
      // O
      'OM': 'Oman',
      
      // P
      'PA': 'Panama', 'PE': 'Peru', 'PF': 'French Polynesia', 'PG': 'Papua New Guinea', 'PH': 'Philippines',
      'PK': 'Pakistan', 'PL': 'Poland', 'PM': 'Saint Pierre and Miquelon', 'PN': 'Pitcairn', 'PR': 'Puerto Rico',
      'PS': 'Palestine', 'PT': 'Portugal', 'PW': 'Palau', 'PY': 'Paraguay',
      
      // Q
      'QA': 'Qatar',
      
      // R
      'RE': 'Réunion', 'RO': 'Romania', 'RS': 'Serbia', 'RU': 'Russia', 'RW': 'Rwanda',
      
      // S
      'SA': 'Saudi Arabia', 'SB': 'Solomon Islands', 'SC': 'Seychelles', 'SD': 'Sudan', 'SE': 'Sweden',
      'SG': 'Singapore', 'SH': 'Saint Helena', 'SI': 'Slovenia', 'SJ': 'Svalbard and Jan Mayen',
      'SK': 'Slovakia', 'SL': 'Sierra Leone', 'SM': 'San Marino', 'SN': 'Senegal', 'SO': 'Somalia',
      'SR': 'Suriname', 'SS': 'South Sudan', 'ST': 'São Tomé and Príncipe', 'SV': 'El Salvador',
      'SX': 'Sint Maarten', 'SY': 'Syria', 'SZ': 'Eswatini',
      
      // T
      'TC': 'Turks and Caicos Islands', 'TD': 'Chad', 'TF': 'French Southern Territories', 'TG': 'Togo',
      'TH': 'Thailand', 'TJ': 'Tajikistan', 'TK': 'Tokelau', 'TL': 'Timor-Leste', 'TM': 'Turkmenistan',
      'TN': 'Tunisia', 'TO': 'Tonga', 'TR': 'Turkey', 'TT': 'Trinidad and Tobago', 'TV': 'Tuvalu',
      'TW': 'Taiwan', 'TZ': 'Tanzania',
      
      // U
      'UA': 'Ukraine', 'UG': 'Uganda', 'UM': 'United States Minor Outlying Islands', 'US': 'United States',
      'UY': 'Uruguay', 'UZ': 'Uzbekistan',
      
      // V
      'VA': 'Vatican City', 'VC': 'Saint Vincent and the Grenadines', 'VE': 'Venezuela', 'VG': 'British Virgin Islands',
      'VI': 'U.S. Virgin Islands', 'VN': 'Vietnam', 'VU': 'Vanuatu',
      
      // W
      'WF': 'Wallis and Futuna', 'WS': 'Samoa',
      
      // Y
      'YE': 'Yemen', 'YT': 'Mayotte',
      
      // Z
      'ZA': 'South Africa', 'ZM': 'Zambia', 'ZW': 'Zimbabwe'
    };
    
    return countryMap[isoCode] || isoCode;
  }

  private parseRegionName(regionCode: string): string {
    if (!regionCode || !regionCode.includes('-')) return '';
    
    const [country, region] = regionCode.split('-');
    
    // US States
    const usStates: { [key: string]: string } = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
      'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
      'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
      'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
      'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
      'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
      'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
      'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
      'DC': 'District of Columbia', 'PR': 'Puerto Rico'
    };

    // Canadian Provinces
    const canadianProvinces: { [key: string]: string } = {
      'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba', 'NB': 'New Brunswick',
      'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia', 'ON': 'Ontario', 'PE': 'Prince Edward Island',
      'QC': 'Quebec', 'SK': 'Saskatchewan', 'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
    };

    // Australian States
    const australianStates: { [key: string]: string } = {
      'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland', 'WA': 'Western Australia',
      'SA': 'South Australia', 'TAS': 'Tasmania', 'ACT': 'Australian Capital Territory', 'NT': 'Northern Territory'
    };

    if (country === 'US') {
      return usStates[region] || region;
    } else if (country === 'CA') {
      return canadianProvinces[region] || region;
    } else if (country === 'AU') {
      return australianStates[region] || region;
    }
    
    return region;
  }

  async searchAirports(query: string, limit: number = 20): Promise<AirportSearchResult[]> {
    await this.loadAirports();
    
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: AirportSearchResult[] = [];

    // Search through airports
    for (const airport of this.airports) {
      if (results.length >= limit) break;

      const matches = 
        airport.iataCode.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm) ||
        airport.region.toLowerCase().includes(searchTerm) ||
        airport.regionCode.toLowerCase().includes(searchTerm);

      if (matches) {
        const fullName = airport.region 
          ? `${airport.name}, ${airport.city}, ${airport.region}, ${airport.country}`
          : `${airport.name}, ${airport.city}, ${airport.country}`;

        results.push({
          iataCode: airport.iataCode,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          region: airport.region,
          regionCode: airport.regionCode,
          type: 'AIRPORT',
          displayName: `${airport.name} (${airport.iataCode})`,
          fullName,
          geoCode: {
            latitude: airport.latitude,
            longitude: airport.longitude,
          },
        });
      }
    }

    // Sort results by relevance
    return results.sort((a, b) => {
      // Exact IATA code match first
      if (a.iataCode.toLowerCase() === searchTerm) return -1;
      if (b.iataCode.toLowerCase() === searchTerm) return 1;
      
      // IATA code starts with query
      if (a.iataCode.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.iataCode.toLowerCase().startsWith(searchTerm)) return 1;
      
      // Region/state name exact match
      if (a.region && a.region.toLowerCase() === searchTerm) return -1;
      if (b.region && b.region.toLowerCase() === searchTerm) return 1;
      
      // Region/state name starts with query
      if (a.region && a.region.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.region && b.region.toLowerCase().startsWith(searchTerm)) return 1;
      
      // City name starts with query
      if (a.city.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.city.toLowerCase().startsWith(searchTerm)) return 1;
      
      // Airport name starts with query
      if (a.name.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.name.toLowerCase().startsWith(searchTerm)) return 1;
      
      return 0;
    });
  }

  // Get popular airports for a specific region/country
  async getPopularAirports(country?: string, region?: string, limit: number = 10): Promise<AirportSearchResult[]> {
    await this.loadAirports();
    
    let filteredAirports = this.airports;
    
    if (country) {
      filteredAirports = filteredAirports.filter(
        airport => airport.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    if (region) {
      filteredAirports = filteredAirports.filter(
        airport => airport.region.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    // For now, just return the first airports (could be enhanced with popularity data)
    return filteredAirports
      .slice(0, limit)
      .map(airport => {
        const fullName = airport.region 
          ? `${airport.name}, ${airport.city}, ${airport.region}, ${airport.country}`
          : `${airport.name}, ${airport.city}, ${airport.country}`;
          
        return {
          iataCode: airport.iataCode,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          region: airport.region,
          regionCode: airport.regionCode,
          type: 'AIRPORT',
          displayName: `${airport.name} (${airport.iataCode})`,
          fullName,
          geoCode: {
            latitude: airport.latitude,
            longitude: airport.longitude,
          },
        };
      });
  }

  // Get airport statistics
  async getStats(): Promise<{ totalAirports: number; countries: number; }> {
    await this.loadAirports();
    
    const uniqueCountries = new Set(this.airports.map(a => a.country));
    
    return {
      totalAirports: this.airports.length,
      countries: uniqueCountries.size,
    };
  }

  async getAirportByCode(iataCode: string): Promise<AirportSearchResult | null> {
    await this.loadAirports();
    
    const airport = this.airports.find(
      a => a.iataCode.toLowerCase() === iataCode.toLowerCase()
    );
    
    if (!airport) return null;
    
    const fullName = airport.region 
      ? `${airport.name}, ${airport.city}, ${airport.region}, ${airport.country}`
      : `${airport.name}, ${airport.city}, ${airport.country}`;
    
    return {
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      region: airport.region,
      regionCode: airport.regionCode,
      type: 'AIRPORT',
      displayName: `${airport.name} (${airport.iataCode})`,
      fullName,
      geoCode: {
        latitude: airport.latitude,
        longitude: airport.longitude,
      },
    };
  }
}

export const airportSearchService = new AirportSearchService();