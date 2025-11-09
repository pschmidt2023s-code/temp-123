/**
 * AI-Based Fraud Detection System
 * 
 * Analysiert Empfehlungs-Einlösungen auf verdächtige Muster
 * und berechnet einen Betrugs-Score (0-100)
 */

export interface FraudAnalysisResult {
  fraudScore: number; // 0-100 (höher = verdächtiger)
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendation: 'allow' | 'review' | 'block';
  details: {
    ipRisk: number;
    deviceRisk: number;
    timingRisk: number;
    behaviorRisk: number;
  };
}

export interface RedemptionData {
  userId: string;
  ipAddress: string;
  deviceId: string;
  userAgent: string;
  timestamp: Date;
}

export interface HistoricalRedemption {
  redeemedByUserId: string;
  ipAddress: string | null;
  deviceId: string | null;
  userAgent: string | null;
  redeemedAt: Date | null;
}

export class FraudDetectionAI {
  /**
   * Hauptmethode: Analysiert eine Einlösung und gibt Fraud-Score zurück
   */
  static analyzeFraudRisk(
    newRedemption: RedemptionData,
    historicalRedemptions: HistoricalRedemption[],
    referrerId: string
  ): FraudAnalysisResult {
    const flags: string[] = [];
    let fraudScore = 0;

    // 1. IP-Adress-Analyse (Gewichtung: 30%)
    const ipRisk = this.analyzeIPRisk(newRedemption, historicalRedemptions);
    fraudScore += ipRisk * 0.3;
    if (ipRisk > 70) flags.push('Verdächtige IP-Wiederholung');

    // 2. Device-ID-Analyse (Gewichtung: 25%)
    const deviceRisk = this.analyzeDeviceRisk(newRedemption, historicalRedemptions);
    fraudScore += deviceRisk * 0.25;
    if (deviceRisk > 70) flags.push('Verdächtige Gerätenutzung');

    // 3. Timing-Analyse (Gewichtung: 25%)
    const timingRisk = this.analyzeTimingPatterns(historicalRedemptions);
    fraudScore += timingRisk * 0.25;
    if (timingRisk > 60) flags.push('Ungewöhnliches Einlösungs-Timing');

    // 4. Verhaltensanalyse (Gewichtung: 20%)
    const behaviorRisk = this.analyzeBehaviorPatterns(newRedemption, historicalRedemptions, referrerId);
    fraudScore += behaviorRisk * 0.2;
    if (behaviorRisk > 60) flags.push('Verdächtiges Verhaltensmuster');

    // User-Agent-Konsistenz prüfen
    const userAgentRisk = this.analyzeUserAgentConsistency(newRedemption, historicalRedemptions);
    if (userAgentRisk > 80) {
      flags.push('Inkonsistente Browser-Informationen');
      fraudScore += 10;
    }

    // Fraud-Score normalisieren (0-100)
    fraudScore = Math.min(100, Math.max(0, fraudScore));

    // Risk-Level bestimmen
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let recommendation: 'allow' | 'review' | 'block';

    if (fraudScore < 30) {
      riskLevel = 'low';
      recommendation = 'allow';
    } else if (fraudScore < 60) {
      riskLevel = 'medium';
      recommendation = 'review';
    } else if (fraudScore < 85) {
      riskLevel = 'high';
      recommendation = 'review';
    } else {
      riskLevel = 'critical';
      recommendation = 'block';
    }

    return {
      fraudScore: Math.round(fraudScore),
      riskLevel,
      flags,
      recommendation,
      details: {
        ipRisk: Math.round(ipRisk),
        deviceRisk: Math.round(deviceRisk),
        timingRisk: Math.round(timingRisk),
        behaviorRisk: Math.round(behaviorRisk),
      },
    };
  }

  /**
   * Analysiert IP-Adressen auf Wiederholungen und Muster
   */
  private static analyzeIPRisk(
    newRedemption: RedemptionData,
    historical: HistoricalRedemption[]
  ): number {
    let risk = 0;

    // Prüfe exakte IP-Matches
    const ipMatches = historical.filter(r => r.ipAddress === newRedemption.ipAddress).length;
    
    if (ipMatches === 1) risk += 40; // Eine Wiederholung: Medium-Risk
    if (ipMatches === 2) risk += 70; // Zwei Wiederholungen: High-Risk
    if (ipMatches >= 3) risk += 95; // 3+ Wiederholungen: Critical

    // Prüfe IP-Subnetz-Ähnlichkeiten (ersten 3 Oktette)
    const subnet = this.getIPSubnet(newRedemption.ipAddress);
    const subnetMatches = historical.filter(r => 
      r.ipAddress && this.getIPSubnet(r.ipAddress) === subnet
    ).length;

    if (subnetMatches >= 2) risk += 30; // Mehrere IPs aus gleichem Subnetz

    return Math.min(100, risk);
  }

  /**
   * Analysiert Device-IDs auf Wiederverwendung
   */
  private static analyzeDeviceRisk(
    newRedemption: RedemptionData,
    historical: HistoricalRedemption[]
  ): number {
    let risk = 0;

    const deviceMatches = historical.filter(r => r.deviceId === newRedemption.deviceId).length;
    
    if (deviceMatches === 1) risk += 50;
    if (deviceMatches === 2) risk += 80;
    if (deviceMatches >= 3) risk += 100;

    return Math.min(100, risk);
  }

  /**
   * Analysiert zeitliche Muster der Einlösungen
   */
  private static analyzeTimingPatterns(historical: HistoricalRedemption[]): number {
    if (historical.length < 2) return 0;

    let risk = 0;

    // Sortiere nach Zeitstempel
    const sorted = [...historical]
      .filter(r => r.redeemedAt)
      .sort((a, b) => (a.redeemedAt!.getTime() - b.redeemedAt!.getTime()));

    // Prüfe auf sehr schnelle aufeinanderfolgende Einlösungen
    for (let i = 1; i < sorted.length; i++) {
      const timeDiff = sorted[i].redeemedAt!.getTime() - sorted[i-1].redeemedAt!.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff < 1) risk += 40; // Weniger als 1 Minute
      else if (minutesDiff < 5) risk += 25; // Weniger als 5 Minuten
      else if (minutesDiff < 30) risk += 10; // Weniger als 30 Minuten
    }

    // Prüfe auf "Burst"-Muster (viele Einlösungen in kurzer Zeit)
    const recentRedemptions = sorted.filter(r => {
      const hoursDiff = (Date.now() - r.redeemedAt!.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24;
    }).length;

    if (recentRedemptions >= 3) risk += 30;
    if (recentRedemptions >= 4) risk += 40;

    return Math.min(100, risk);
  }

  /**
   * Analysiert Verhaltensmuster
   */
  private static analyzeBehaviorPatterns(
    newRedemption: RedemptionData,
    historical: HistoricalRedemption[],
    referrerId: string
  ): number {
    let risk = 0;

    // Prüfe, ob neuer Benutzer verdächtig ähnlich zum Referrer ist
    if (this.areUserIdsSimilar(newRedemption.userId, referrerId)) {
      risk += 60; // Ähnliche UserIDs deuten auf Selbst-Betrug hin
    }

    // Prüfe User-ID-Muster in historischen Daten
    const userIds = historical.map(r => r.redeemedByUserId);
    const sequentialIds = this.detectSequentialPattern(userIds);
    if (sequentialIds) {
      risk += 50; // Sequentielle IDs (user1, user2, user3...) sind verdächtig
    }

    return Math.min(100, risk);
  }

  /**
   * Analysiert User-Agent-Konsistenz
   */
  private static analyzeUserAgentConsistency(
    newRedemption: RedemptionData,
    historical: HistoricalRedemption[]
  ): number {
    if (historical.length === 0) return 0;

    let risk = 0;

    // Wenn alle bisherigen Einlösungen denselben User-Agent haben
    const uniqueUserAgents = new Set(historical.map(r => r.userAgent).filter(Boolean));
    
    if (uniqueUserAgents.size === 1 && historical.length >= 2) {
      // Alle verwenden denselben Browser - verdächtig
      risk += 70;
    }

    return risk;
  }

  /**
   * Hilfsfunktion: Extrahiert IP-Subnetz
   */
  private static getIPSubnet(ip: string): string {
    if (!ip || ip === 'unknown') return '';
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.');
  }

  /**
   * Hilfsfunktion: Prüft ob UserIDs ähnlich sind
   */
  private static areUserIdsSimilar(userId1: string, userId2: string): boolean {
    // Entferne Zahlen am Ende und vergleiche
    const base1 = userId1.replace(/\d+$/, '');
    const base2 = userId2.replace(/\d+$/, '');
    
    if (base1 && base2 && base1 === base2) return true;

    // Levenshtein-Distanz für ähnliche Strings
    const distance = this.levenshteinDistance(userId1, userId2);
    return distance <= 3;
  }

  /**
   * Hilfsfunktion: Erkennt sequentielle Muster
   */
  private static detectSequentialPattern(userIds: string[]): boolean {
    if (userIds.length < 3) return false;

    // Prüfe ob IDs sequentiell sind (z.B. user1, user2, user3)
    for (let i = 0; i < userIds.length - 2; i++) {
      const match1 = userIds[i].match(/(\D+)(\d+)$/);
      const match2 = userIds[i + 1].match(/(\D+)(\d+)$/);
      const match3 = userIds[i + 2].match(/(\D+)(\d+)$/);

      if (match1 && match2 && match3) {
        const [, base1, num1] = match1;
        const [, base2, num2] = match2;
        const [, base3, num3] = match3;

        if (base1 === base2 && base2 === base3) {
          const n1 = parseInt(num1);
          const n2 = parseInt(num2);
          const n3 = parseInt(num3);

          if (n2 === n1 + 1 && n3 === n2 + 1) {
            return true; // Sequentielles Muster gefunden
          }
        }
      }
    }

    return false;
  }

  /**
   * Hilfsfunktion: Berechnet Levenshtein-Distanz
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generiert einen menschenlesbaren Fraud-Report
   */
  static generateFraudReport(analysis: FraudAnalysisResult): string {
    const lines: string[] = [];
    
    lines.push('=== BETRUGS-ANALYSE-REPORT ===');
    lines.push(`Fraud-Score: ${analysis.fraudScore}/100`);
    lines.push(`Risiko-Level: ${analysis.riskLevel.toUpperCase()}`);
    lines.push(`Empfehlung: ${analysis.recommendation.toUpperCase()}`);
    lines.push('');
    lines.push('Details:');
    lines.push(`  - IP-Risiko: ${analysis.details.ipRisk}/100`);
    lines.push(`  - Device-Risiko: ${analysis.details.deviceRisk}/100`);
    lines.push(`  - Timing-Risiko: ${analysis.details.timingRisk}/100`);
    lines.push(`  - Verhaltens-Risiko: ${analysis.details.behaviorRisk}/100`);
    
    if (analysis.flags.length > 0) {
      lines.push('');
      lines.push('Warnungen:');
      analysis.flags.forEach(flag => lines.push(`  ⚠ ${flag}`));
    }
    
    return lines.join('\n');
  }
}
