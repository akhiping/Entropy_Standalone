import { v4 as uuidv4 } from 'uuid';

// ID Generation
export const generateId = (): string => uuidv4();

export const generateStickyId = (): string => `sticky_${generateId()}`;

export const generateBranchId = (): string => `branch_${generateId()}`;

export const generateMindmapId = (): string => `mindmap_${generateId()}`;

// Validation Helpers
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0;
};

export const isValidPosition = (position: { x: number; y: number }): boolean => {
  return typeof position.x === 'number' && typeof position.y === 'number';
};

// Similarity Calculations
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
};

// Text Processing Utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const extractKeywords = (text: string): string[] => {
  // Simple keyword extraction - split by common delimiters and filter
  return text
    .toLowerCase()
    .split(/[\s,;:.!?]+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));
};

// Date Utilities
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Color Utilities
export const generateRandomColor = (): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#c084fc', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Deep Clone Utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Position Utilities
export const calculateDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number => {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateMidpoint = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): { x: number; y: number } => {
  return {
    x: (pos1.x + pos2.x) / 2,
    y: (pos1.y + pos2.y) / 2,
  };
}; 