import axios from 'axios';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // in meters
  moving_time: number; // in seconds
  elapsed_time: number;
  type: string;
  start_date: string;
  average_speed: number; // m/s
  max_speed: number;
  elevation_gain: number;
}

export async function getStravaActivities(accessToken: string, limit: number = 30) {
  try {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { per_page: limit },
    });
    return response.data as StravaActivity[];
  } catch (error) {
    console.error('Strava API error:', error);
    return [];
  }
}

export async function getStravaAthlete(accessToken: string) {
  try {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Strava athlete error:', error);
    return null;
  }
}

// Converte m/s a min:sec per km
export function speedToMinPerKm(speedMs: number): string {
  if (speedMs === 0) return '0:00';
  const minPerKm = 1000 / (speedMs * 60);
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Converte metri a km
export function metersToKm(meters: number): number {
  return Math.round((meters / 1000) * 100) / 100;
}

// Converte secondi a tempo leggibile
export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}
