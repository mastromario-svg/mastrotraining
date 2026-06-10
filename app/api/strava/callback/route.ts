import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, uid } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code mancante' }, { status: 400 });
    }

    // Scambia il code con il token
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    return NextResponse.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      athlete: response.data.athlete,
    });
  } catch (error: any) {
    console.error('Strava callback error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Errore nel callback Strava' },
      { status: 500 }
    );
  }
}
