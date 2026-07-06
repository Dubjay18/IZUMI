import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CreditMetrics {
  monthlyRevenue: number;
  revenueVolatility: number;
  transactionCount: number;
  averageTicketSize: number;
  operatingCosts: number;
  sector: string;
}

export interface CreditAssessment {
  creditScore: number;
  creditGrade: 'A' | 'B' | 'C';
  approvedLimit: number;
  recommendedInterestPremium: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    businessTips: string[];
  };
}

const responseSchema: any = {
  type: 'object',
  properties: {
    creditScore: { type: 'integer', description: 'Credit score from 0 to 100' },
    creditGrade: { type: 'string', enum: ['A', 'B', 'C'], description: 'Credit grade representing risk level: A (Low), B (Moderate), C (High)' },
    approvedLimit: { type: 'number', description: 'Approved credit limit in Naira (max 1.5x monthly net profit)' },
    recommendedInterestPremium: { type: 'number', description: 'Recommended lending rate premium percentage' },
    analysis: {
      type: 'object',
      properties: {
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        businessTips: { type: 'array', items: { type: 'string' } }
      },
      required: ['strengths', 'weaknesses', 'businessTips']
    }
  },
  required: ['creditScore', 'creditGrade', 'approvedLimit', 'recommendedInterestPremium', 'analysis']
};

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'mock-key-for-development') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async scoreSmeCredit(metrics: CreditMetrics): Promise<CreditAssessment> {
    // If no API Key is available or if we are using mock-key-for-development, return a simulated response
    if (!this.genAI) {
      console.warn('AI Service: GEMINI_API_KEY is not configured. Returning mock scoring data.');
      return this.generateMockScore(metrics);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const prompt = `
        You are an expert financial credit officer for Nigerian SMEs. Your task is to calculate a Credit Score Grade and approved lending limit for this business.
        
        BUSINESS PROFILE:
        - Business Sector: ${metrics.sector}
        - Monthly Revenue: ₦${metrics.monthlyRevenue.toLocaleString()}
        - Operating Costs: ₦${metrics.operatingCosts.toLocaleString()}
        - Monthly Transaction Count: ${metrics.transactionCount}
        - Revenue Volatility: ${Math.round(metrics.revenueVolatility * 100)}%
        
        INSTRUCTIONS:
        1. Assign a Credit Grade: A (Very Low Risk), B (Moderate Risk), C (High Risk).
        2. Calculate Approved Credit Limit: Maximum of 1.5x average net profit (Monthly Revenue - Operating Costs). If net profit is negative or zero, credit limit should be 0.
        3. Return key strengths and risks based on the volatility, ticket size, and sector.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as CreditAssessment;
    } catch (error) {
      console.error('Error generating AI credit score:', error);
      throw new Error(`Failed to score SME credit via Gemini: ${(error as Error).message}`);
    }
  }

  private generateMockScore(metrics: CreditMetrics): CreditAssessment {
    const netProfit = metrics.monthlyRevenue - metrics.operatingCosts;
    const baseLimit = Math.max(0, netProfit * 1.2);
    
    let creditGrade: 'A' | 'B' | 'C' = 'B';
    let creditScore = 70;
    
    if (metrics.revenueVolatility < 0.1 && netProfit > 300000) {
      creditGrade = 'A';
      creditScore = 85;
    } else if (metrics.revenueVolatility > 0.3 || netProfit < 100000) {
      creditGrade = 'C';
      creditScore = 45;
    }

    return {
      creditScore,
      creditGrade,
      approvedLimit: baseLimit,
      recommendedInterestPremium: creditGrade === 'A' ? 8.5 : creditGrade === 'B' ? 12.0 : 18.0,
      analysis: {
        strengths: [
          `Consistent performance in the ${metrics.sector} sector.`,
          `Average ticket size of ₦${metrics.averageTicketSize.toLocaleString()} matches expected industry benchmark.`
        ],
        weaknesses: [
          metrics.revenueVolatility > 0.2 
            ? `Revenue volatility of ${Math.round(metrics.revenueVolatility * 100)}% presents a repayment risk.` 
            : 'Limited business history captured in transaction logs.'
        ],
        businessTips: [
          'Maintain stable average monthly inflows to improve next credit check score.',
          'Reduce operating costs to enhance overall net profit margins.'
        ]
      }
    };
  }

  async askAdvisoryQuestion(question: string, context?: string): Promise<string> {
    if (!this.genAI) {
      console.warn('AI Service: GEMINI_API_KEY is not configured. Returning mock advisory chat response.');
      return `I received your question: "${question}". To optimize your cashflow and credit score, make sure you consistently route transaction volume through your Nomba POS terminals and maintain a sweep repayment rate of 10% to speed up your loan maturity. Let me know if you need specific inventory tips!`;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are the "Izumi AI Credit Advisory Consultant," an AI assistant helping Nigerian micro-merchants and SMEs optimize their financial performance and manage credit scores.
        
        CONTEXT DETAILS:
        ${context || 'No specific business logs available.'}
        
        MERCHANT QUESTION:
        "${question}"
        
        INSTRUCTIONS:
        Write a friendly, concise, and highly practical financial advice response tailored for small business owners in Nigeria. Keep the response under 4-5 sentences and focus on actionable takeaways (e.g. optimizing card sweeps, stocking, or cost reductions).
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating AI advisory chat:', error);
      return `Failed to analyze advisory chat via Gemini: ${(error as Error).message}`;
    }
  }
}

export const aiService = new AiService();
