export interface TargetSegment {
  text: string;
  isOrgan: boolean;
  colorClass?: string;
}

export function parseGameHistoryTarget(target: string | undefined): TargetSegment[] {
  if (!target) {
    return [];
  }

  // Matches "Órgano " followed by Corazón, Estómago, Cerebro, Hueso, Mutante or Multicolor
  const regex = /(Órgano (?:Corazón|Estómago|Cerebro|Hueso|Mutante|Multicolor))/g;
  
  const segments: TargetSegment[] = [];
  let lastIndex = 0;
  
  let match;
  while ((match = regex.exec(target)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: target.substring(lastIndex, match.index),
        isOrgan: false
      });
    }
    
    const organText = match[0];
    let colorClass = '';
    if (organText.includes('Corazón')) colorClass = 'history-target--red';
    else if (organText.includes('Estómago')) colorClass = 'history-target--green';
    else if (organText.includes('Cerebro')) colorClass = 'history-target--blue';
    else if (organText.includes('Hueso')) colorClass = 'history-target--yellow';
    else if (organText.includes('Mutante')) colorClass = 'history-target--orange';
    else if (organText.includes('Multicolor')) colorClass = 'history-target--multi';
    
    segments.push({
      text: organText,
      isOrgan: true,
      colorClass
    });
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < target.length) {
    segments.push({
      text: target.substring(lastIndex),
      isOrgan: false
    });
  }
  
  return segments;
}
