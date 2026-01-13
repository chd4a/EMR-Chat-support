
import { SheetData } from '../types';

export const fetchSheetAsCsv = async (sheetUrl: string): Promise<SheetData> => {
  // Extract spreadsheet ID from various URL formats
  const sheetIdMatch = sheetUrl.match(/[-\w]{25,}/);
  if (!sheetIdMatch) {
    throw new Error('Invalid Google Sheet URL. Please ensure it is a full URL.');
  }
  const sheetId = sheetIdMatch[0];
  
  // Use the gviz endpoint to get CSV output
  // Note: The sheet must be "Anyone with the link can view"
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch spreadsheet. Ensure the sheet is shared as "Anyone with the link can view".');
  }

  const csvText = await response.text();
  
  // Simple CSV parser that handles quotes
  const parseCsvLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) {
    throw new Error('The spreadsheet appears to be empty.');
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);

  return {
    headers,
    rows,
    rawCsv: csvText,
    lastUpdated: new Date()
  };
};
