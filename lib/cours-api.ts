import type { MobileBlock } from '@/components/mobile-article-body';
import { fetchJsonAvecTimeout } from '@/components/mobile-api';

const API_BASE = 'https://laksmie.fr/wp-json/mobile/v1/cours';

export type Cover = { url: string; alt?: string } | null;

export type CoursListItem = {
  id: number;
  title: string;
  excerpt: string;
  cover?: Cover;
};

export type CoursDetail = {
  id: number;
  title: string;
  cover?: Cover;
  blocks: MobileBlock[];
};

export async function fetchCoursList(): Promise<CoursListItem[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = (await res.json()) as CoursListItem[];
  return Array.isArray(data) ? data : [];
}

export async function fetchCoursDetail(id: number, timeoutMs = 20000): Promise<CoursDetail> {
  return fetchJsonAvecTimeout<CoursDetail>(`${API_BASE}/${id}`, timeoutMs);
}
