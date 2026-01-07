/**
 * @file topic.types.ts
 * @description Types relatifs aux sujets (Topics)
 */

import type { Session } from './session.types';

export interface Topic {
  readonly id: string;
  readonly title: string;
  readonly sessions: Session[];
}

export interface TopicTheme {
  readonly icon: string;
  readonly color: string;
  readonly gradient: readonly [string, string];
}

export interface TopicCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}
