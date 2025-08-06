// utils/confidence.ts
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractionConfidence {
  title: ConfidenceLevel;
  contributors: ConfidenceLevel;
  publication_info: ConfidenceLevel;
}

export interface ExtractedDataWithConfidence {
  // Standard extracted data fields
  title?: string | null;
  subtitle?: string | null;
  authors?: Array<{
    name: string;
    role: string;
    confidence: ConfidenceLevel;
  }> | null;
  publisher?: string | null;
  publication_year?: number | null;
  publication_location?: string | null;
  edition_statement?: string | null;
  has_dust_jacket?: boolean | null;
  
  // New confidence indicators
  extraction_confidence?: ExtractionConfidence;
}

/**
 * Calculate overall confidence level from extraction confidence data
 * Uses the lowest confidence level across all categories as the overall confidence
 * 
 * @param extractedData - The extracted data from the AI processing
 * @returns Overall confidence level (high/medium/low)
 */
export const calculateOverallConfidence = (
  extractedData: ExtractedDataWithConfidence | null | undefined
): ConfidenceLevel => {
  // Handle legacy jobs or missing data - default to high confidence
  if (!extractedData?.extraction_confidence) {
    return 'high';
  }

  const { extraction_confidence } = extractedData;
  
  // Get all confidence levels, filtering out any undefined values
  const confidenceLevels = [
    extraction_confidence.title,
    extraction_confidence.contributors,
    extraction_confidence.publication_info
  ].filter(Boolean) as ConfidenceLevel[];

  // If no valid confidence levels found, default to high
  if (confidenceLevels.length === 0) {
    return 'high';
  }

  // Return the lowest confidence level found
  // Priority: low > medium > high (lowest confidence wins)
  if (confidenceLevels.includes('low')) {
    return 'low';
  }
  if (confidenceLevels.includes('medium')) {
    return 'medium';
  }
  return 'high';
};

/**
 * Get display text for confidence level
 */
export const getConfidenceDisplayText = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high':
      return 'Ready for Review';
    case 'medium':
      return 'Review Carefully';
    case 'low':
      return 'Needs Attention';
    default:
      return 'Ready for Review';
  }
};

/**
 * Get accessibility label for confidence level
 */
export const getConfidenceAccessibilityLabel = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high':
      return 'Ready for review, high confidence extraction';
    case 'medium':
      return 'Review carefully, medium confidence extraction';
    case 'low':
      return 'Needs attention, low confidence extraction';
    default:
      return 'Ready for review';
  }
};

/**
 * Get icon name and color for confidence level
 */
export const getConfidenceIcon = (confidence: ConfidenceLevel): {
  name: 'CheckCircle2' | 'AlertTriangle' | 'AlertCircle';
  color: string;
} => {
  switch (confidence) {
    case 'high':
      return { name: 'CheckCircle2', color: '#22C55E' }; // Green
    case 'medium':
      return { name: 'AlertTriangle', color: '#F59E0B' }; // Amber
    case 'low':
      return { name: 'AlertCircle', color: '#EF4444' }; // Red
    default:
      return { name: 'CheckCircle2', color: '#22C55E' };
  }
};

/**
 * Get background color for confidence level
 */
export const getConfidenceBackgroundColor = (confidence: ConfidenceLevel): string => {
  switch (confidence) {
    case 'high':
      return 'white'; // Keep existing white background
    case 'medium':
      return '#FEF3C7'; // Light amber background
    case 'low':
      return '#FEF2F2'; // Light red background
    default:
      return 'white';
  }
};