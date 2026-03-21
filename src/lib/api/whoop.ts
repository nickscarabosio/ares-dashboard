export interface WHOOPMetrics {
  strain: number;
  recovery: number;
  sleep: number;
  fitnessScore: number;
}

function getWHOOPToken(): string {
  const token = process.env.NEXT_PUBLIC_WHOOP_TOKEN;
  if (!token) {
    throw new Error('WHOOP token not configured in environment');
  }
  return token;
}

export async function fetchWHOOPMetrics(): Promise<WHOOPMetrics> {
  try {
    const accessToken = getWHOOPToken();

    const sleepResponse = await fetch('https://api.whoop.com/api/v4/physiological_data/sleep', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (sleepResponse.status === 401) throw new Error('WHOOP: Unauthorized (token expired)');
    if (sleepResponse.status === 429) throw new Error('WHOOP: Rate limited. Please try again later.');
    if (!sleepResponse.ok) throw new Error(`WHOOP Sleep: HTTP ${sleepResponse.status}`);

    const sleepData = await sleepResponse.json();
    const avgSleep = sleepData.records?.length > 0
      ? sleepData.records.reduce((sum: number, r: any) => sum + (r.duration_in_seconds / 3600), 0) / sleepData.records.length
      : 0;

    const recoveryResponse = await fetch('https://api.whoop.com/api/v4/physiological_data/heart_rate', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!recoveryResponse.ok) throw new Error(`WHOOP Recovery: HTTP ${recoveryResponse.status}`);

    const recoveryData = await recoveryResponse.json();
    const avgRecovery = recoveryData.records?.length > 0
      ? recoveryData.records.reduce((sum: number, r: any) => sum + (r.recovery_score || 50), 0) / recoveryData.records.length
      : 50;

    const strainResponse = await fetch('https://api.whoop.com/api/v4/physiological_data/strain', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!strainResponse.ok) throw new Error(`WHOOP Strain: HTTP ${strainResponse.status}`);

    const strainData = await strainResponse.json();
    const avgStrain = strainData.records?.length > 0
      ? strainData.records.reduce((sum: number, r: any) => sum + (r.kilojoule / 1000), 0) / strainData.records.length
      : 0;

    const sleepScore = Math.min(avgSleep / 9 * 3, 3);
    const recoveryScore = (avgRecovery / 100) * 3;
    const strainScore = Math.min(avgStrain / 21 * 4, 4);
    const fitnessScore = Math.round((sleepScore + recoveryScore + strainScore) * 10) / 10;

    return {
      strain: Math.round(avgStrain * 10) / 10,
      recovery: Math.round(avgRecovery),
      sleep: Math.round(avgSleep * 10) / 10,
      fitnessScore: Math.max(Math.min(fitnessScore, 10), 0),
    };
  } catch (error) {
    console.error('WHOOP API error:', error);
    throw error;
  }
}
