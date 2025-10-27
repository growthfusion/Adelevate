//import openai, { validateApiKey } from './openaiClient';

/**
 * Generates AI-powered strategic insights using GPT-5
 * @param {Object} platformData - Performance data for all platforms
 * @param {string} selectedPlatform - Currently selected platform
 * @returns {Promise<Object>} Structured AI insights
 */
export async function generateStrategicInsights(platformData, selectedPlatform = 'all') {
  // Check if API key is configured
  if (!validateApiKey() || !openai) {
    return {
      insights: [
        {
          type: 'alert',
          priority: 'high',
          title: 'OpenAI API Key Not Configured',
          description: 'Please configure your OpenAI API key in the .env file to enable AI-powered insights.',
          impact: 'AI insights unavailable',
          action: 'Add VITE_OPENAI_API_KEY to .env file',
          confidence: 1.0,
          platforms: ['all']
        }
      ],
      summary: 'AI-powered insights require proper OpenAI API key configuration.',
      recommendations: [
        'Get your API key from https://platform.openai.com/account/api-keys',
        'Add VITE_OPENAI_API_KEY=sk-your-key-here to your .env file',
        'Restart your development server after adding the key'
      ]
    };
  }

  try {
    const prompt = `
    Analyze this advertising performance data and provide strategic insights:
    
    Platform Data: ${JSON.stringify(platformData, null, 2)}
    Selected Platform: ${selectedPlatform}
    
    Focus on:
    1. Cross-platform optimization opportunities
    2. Budget reallocation strategies
    3. Performance anomalies and their causes
    4. Scaling opportunities
    5. Risk mitigation recommendations
    `;

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o-mini', // Use reliable model instead of gpt-5
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert digital marketing strategist specializing in multi-platform advertising optimization. Provide actionable, data-driven insights with specific recommendations and impact estimates.' 
        },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'strategic_insights',
          schema: {
            type: 'object',
            properties: {
              insights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['opportunity', 'optimization', 'alert', 'prediction'] },
                    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    impact: { type: 'string' },
                    action: { type: 'string' },
                    confidence: { type: 'number', minimum: 0, maximum: 1 },
                    platforms: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['type', 'priority', 'title', 'description', 'impact', 'action', 'confidence']
                }
              },
              summary: { type: 'string' },
              recommendations: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            required: ['insights', 'summary', 'recommendations'],
            additionalProperties: false,
          },
        },
      },
      max_tokens: 2000,
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('Error generating strategic insights:', error);
    
    // Check if it's an API key error
    if (error?.message?.includes('401') || error?.message?.includes('API key')) {
      return {
        insights: [
          {
            type: 'alert',
            priority: 'critical',
            title: 'OpenAI API Authentication Failed',
            description: 'Invalid or incorrect OpenAI API key. Please check your API key configuration.',
            impact: 'AI insights unavailable',
            action: 'Verify API Key Configuration',
            confidence: 1.0,
            platforms: ['all']
          }
        ],
        summary: 'Authentication error prevented AI insight generation.',
        recommendations: [
          'Verify your OpenAI API key is correct',
          'Ensure the key has sufficient credits',
          'Check https://platform.openai.com/account/api-keys for valid keys'
        ]
      };
    }

    // Return fallback insights for other errors
    return {
      insights: [
        {
          type: 'optimization',
          priority: 'medium',
          title: 'AI Insights Temporarily Unavailable',
          description: 'Unable to generate real-time insights due to technical issues. Manual analysis recommended.',
          impact: 'Limited insight generation',
          action: 'Review Performance Manually',
          confidence: 0.5,
          platforms: ['all']
        }
      ],
      summary: 'AI-powered insights are currently unavailable due to technical issues.',
      recommendations: [
        'Check network connectivity',
        'Review platform performance metrics manually',
        'Try again in a few moments'
      ]
    };
  }
}

/**
 * Generates platform comparison analysis
 * @param {Object} platformData - Performance data for platforms
 * @returns {Promise<Object>} Platform comparison insights
 */
export async function generatePlatformComparison(platformData) {
  // Check if API key is configured
  if (!validateApiKey() || !openai) {
    return {
      comparison: [
        {
          platform: 'Configuration Required',
          score: 0,
          strengths: [],
          weaknesses: ['OpenAI API key not configured'],
          recommendation: 'Please configure your OpenAI API key to enable platform comparison analysis.',
          budgetSuggestion: 'N/A - Configuration required'
        }
      ],
      winner: 'Configuration needed',
      summary: 'Platform comparison requires OpenAI API key configuration.'
    };
  }

  try {
    const prompt = `
    Compare the performance of these advertising platforms and provide detailed analysis:
    
    ${JSON.stringify(platformData, null, 2)}
    
    Provide:
    1. ROI comparison across platforms
    2. Cost efficiency analysis
    3. Audience quality insights
    4. Platform-specific recommendations
    5. Budget allocation suggestions
    `;

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o-mini', // Use reliable model instead of gpt-5
      messages: [
        { 
          role: 'system', 
          content: 'You are a performance marketing analyst. Compare platforms objectively, highlighting strengths, weaknesses, and optimization opportunities for each.' 
        },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'platform_comparison',
          schema: {
            type: 'object',
            properties: {
              comparison: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    platform: { type: 'string' },
                    score: { type: 'number', minimum: 0, maximum: 100 },
                    strengths: { type: 'array', items: { type: 'string' } },
                    weaknesses: { type: 'array', items: { type: 'string' } },
                    recommendation: { type: 'string' },
                    budgetSuggestion: { type: 'string' }
                  },
                  required: ['platform', 'score', 'strengths', 'weaknesses', 'recommendation']
                }
              },
              winner: { type: 'string' },
              summary: { type: 'string' }
            },
            required: ['comparison', 'winner', 'summary'],
            additionalProperties: false,
          },
        },
      },
      max_tokens: 2000,
    });

    return JSON.parse(response?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error('Error generating platform comparison:', error);
    return {
      comparison: [
        {
          platform: 'Analysis Error',
          score: 0,
          strengths: [],
          weaknesses: ['Unable to generate analysis'],
          recommendation: 'Check API configuration and try again.',
          budgetSuggestion: 'Manual analysis recommended'
        }
      ],
      winner: 'Analysis unavailable',
      summary: 'Platform comparison temporarily unavailable due to technical issues.'
    };
  }
}