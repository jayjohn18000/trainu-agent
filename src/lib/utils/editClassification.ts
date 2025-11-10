/**
 * Classifies the type of edit made to a message
 */
export type EditType = 
  | 'tone_change' 
  | 'content_change' 
  | 'length_adjustment' 
  | 'personalization' 
  | 'minor_tweak';

interface EditClassificationResult {
  editType: EditType;
  changePercentage: number;
  details: string;
}

/**
 * Analyzes the difference between original and edited content
 * to determine the type of edit made
 */
export function classifyEdit(
  original: string,
  edited: string
): EditClassificationResult {
  const originalWords = original.toLowerCase().split(/\s+/);
  const editedWords = edited.toLowerCase().split(/\s+/);
  
  const lengthDiff = Math.abs(edited.length - original.length);
  const lengthChangePercent = (lengthDiff / original.length) * 100;
  
  // Calculate word-level similarity
  const commonWords = originalWords.filter(w => editedWords.includes(w)).length;
  const totalWords = Math.max(originalWords.length, editedWords.length);
  const similarity = commonWords / totalWords;
  const changePercentage = (1 - similarity) * 100;
  
  // Detect tone indicators
  const toneIndicators = {
    formal: ['dear', 'sincerely', 'regards', 'kindly', 'please'],
    casual: ['hey', 'hi', 'thanks', 'cool', 'awesome'],
    motivational: ['great', 'amazing', 'excellent', 'proud', 'crushing'],
  };
  
  const originalTone = detectTone(original, toneIndicators);
  const editedTone = detectTone(edited, toneIndicators);
  const toneChanged = originalTone !== editedTone;
  
  // Personalization indicators
  const hasPersonalization = (text: string) => {
    return /\{[^}]+\}/.test(text) || text.includes('{{') || text.includes('}}');
  };
  const personalAdded = !hasPersonalization(original) && hasPersonalization(edited);
  
  // Classification logic
  if (changePercentage < 10) {
    return {
      editType: 'minor_tweak',
      changePercentage,
      details: 'Minor punctuation or wording adjustments'
    };
  }
  
  if (personalAdded) {
    return {
      editType: 'personalization',
      changePercentage,
      details: 'Added personalization tokens or client-specific details'
    };
  }
  
  if (toneChanged) {
    return {
      editType: 'tone_change',
      changePercentage,
      details: `Changed tone from ${originalTone} to ${editedTone}`
    };
  }
  
  if (lengthChangePercent > 30) {
    return {
      editType: 'length_adjustment',
      changePercentage,
      details: edited.length > original.length ? 'Expanded message' : 'Condensed message'
    };
  }
  
  return {
    editType: 'content_change',
    changePercentage,
    details: 'Significant content modifications'
  };
}

function detectTone(
  text: string, 
  indicators: Record<string, string[]>
): string {
  const lower = text.toLowerCase();
  let maxMatches = 0;
  let detectedTone = 'neutral';
  
  for (const [tone, keywords] of Object.entries(indicators)) {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedTone = tone;
    }
  }
  
  return detectedTone;
}
