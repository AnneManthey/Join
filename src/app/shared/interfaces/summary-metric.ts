
/** Represents a summary metric grouped by task status. */
export interface StatusMetric {
  id: string;
  label: string;
  value: number;
  icon: 'todo' | 'done' | 'urgent';
}

/** Represents a general numeric summary metric. */
export interface StatMetric {
  id: string;
  value: number;
  label: string;
}


