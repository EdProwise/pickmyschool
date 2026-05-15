'use client';

import { use } from 'react';
import { SchoolDashboard } from '../page';

const VALID_TABS = [
  'dashboard',
  'lead-dashboard',
  'enquiry',
  'pms-lead',
  'whatsapp-api',
  'enquiry-settings',
  'school-page',
  'basic-info',
  'contact',
  'facilities',
  'gallery',
  'virtualtour',
  'fees',
  'results',
  'alumini',
  'news',
  'review',
  'analytics',
  'pms-invoice',
  'settings',
];

export default function SchoolTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = use(params);
  const activeTab = VALID_TABS.includes(tab) ? tab : 'dashboard';
  return <SchoolDashboard initialTab={activeTab} />;
}
