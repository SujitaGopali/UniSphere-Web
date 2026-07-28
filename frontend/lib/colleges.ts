export const NEPAL_COLLEGES = [
  "Herald College Kathmandu (University of Wolverhampton)",
  "Islington College (London Metropolitan University)",
  "The British College (UWE Bristol / Leeds Beckett)",
  "Softwarica College of IT & E-Commerce (Coventry University)",
  "ISMT College (University of Sunderland)",
  "Patan College for Professional Studies (PCPS - University of Bedfordshire)",
  "LBEF Campus (Asia Pacific University)",
  "Presidential Business School (Westcliff University)",
  "NAMI College (University of Northampton)",
  "Virinchi College (Asia e University)",
  "Texas College of Management and IT (Lincoln University)",
  "Phoenix College of Management (Lincoln University)",
  "King's College (Westcliff University)",
  "IIMS College (UCSI University)",
  "Sunway International Business School (Birmingham City University)",
  "Mid-Valley International College (Help University)",
  "Ritz Hospitality Management College (BHMS)",
] as const;

export function getCollegeOptions(currentCollege?: string) {
  const trimmedCollege = currentCollege?.trim();

  if (!trimmedCollege) {
    return [...NEPAL_COLLEGES];
  }

  const isExistingCollege = NEPAL_COLLEGES.includes(trimmedCollege as (typeof NEPAL_COLLEGES)[number]);

  return isExistingCollege ? [...NEPAL_COLLEGES] : [trimmedCollege, ...NEPAL_COLLEGES];
}
