import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const crmApiKey = process.env.VITE_CRM_API_KEY;
    
    if (!crmApiKey) {
      return NextResponse.json(
        { error: 'CRM API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://crm.nickscarabosio.com/api/deals', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${crmApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CRM API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const deals = await response.json();
    return NextResponse.json(deals);
  } catch (error) {
    console.error('CRM API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals from CRM' },
      { status: 500 }
    );
  }
}
