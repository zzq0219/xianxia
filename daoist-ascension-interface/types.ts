import { LucideIcon } from 'lucide-react';

export enum ViewMode {
  HOME = 'HOME',       // Sect/Management View
  ADVENTURE = 'ADVENTURE', // Story/Combat View
  CHARACTER = 'CHARACTER', // Bag/Stats Overlay
  MAP = 'MAP', // New Map View
}

export enum GameMode {
  EXPLORE = 'EXPLORE',
  BATTLE = 'BATTLE',
}

export interface MapNode {
  id: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'sect' | 'city' | 'dungeon' | 'secret' | 'resource';
  difficulty: string;
  desc: string;
  isUnlocked: boolean;
  isCurrent?: boolean;
  connections: string[]; // IDs of connected nodes
}

export interface Buff {
  id: string;
  name: string;
  icon: string; // Using string to map to lucide icons or image urls roughly
  type: 'good' | 'bad';
  stacks: number;
}

export interface PlayerStats {
  name: string;
  realm: string;
  spiritStones: number;
  location: string;
  avatarUrl: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  buffs: Buff[];
}

export interface EnemyStats {
  name: string;
  realm: string;
  avatarUrl: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  isBoss: boolean;
  buffs: Buff[];
}

export interface ActionOption {
  id: string;
  text: string;
  type: 'neutral' | 'combat' | 'event';
  desc?: string; // Description for combat skills
}

export type MenuCategory = 'sect' | 'world' | 'personal';

export interface SystemMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  category: MenuCategory;
  desc?: string; // Short description for the dashboard
  color?: string;
}