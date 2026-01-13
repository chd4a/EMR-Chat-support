
export interface Source {
  title: string;
  url: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Source[];
}

export interface SheetData {
  headers: string[];
  rows: string[][];
  rawCsv: string;
  lastUpdated: Date;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING_SHEET = 'LOADING_SHEET',
  SHEET_LOADED = 'SHEET_LOADED',
  ERROR = 'ERROR'
}
