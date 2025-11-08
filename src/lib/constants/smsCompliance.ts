/**
 * SMS Compliance - TCPA/STOP Requirements
 * All outbound SMS messages must include unsubscribe instructions
 */

export function addStopCompliance(message: string): string {
  const stopText = "\n\nReply STOP to unsubscribe";
  
  // Check if STOP instruction already exists
  if (message.toLowerCase().includes("stop") && 
      message.toLowerCase().includes("unsubscribe")) {
    return message;
  }
  
  return message + stopText;
}

export function validateSMSLength(message: string): { 
  valid: boolean; 
  length: number; 
  segments: number;
  error?: string;
} {
  const length = message.length;
  
  // SMS standard: 160 chars per segment, but we recommend staying under 306 (2 segments with compliance)
  const segments = Math.ceil(length / 160);
  
  if (length > 306) {
    return {
      valid: false,
      length,
      segments,
      error: "Message too long. Keep under 306 characters (2 SMS segments) including STOP notice."
    };
  }
  
  return {
    valid: true,
    length,
    segments
  };
}
