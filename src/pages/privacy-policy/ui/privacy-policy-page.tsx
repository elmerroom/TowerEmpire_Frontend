import React from 'react';
import { PolicyPage } from '@/shared/ui/policy-page';
import data from '@/shared/assets/policies/privacy-policy-en.json';
import { PolicyData } from '@/shared/ui/policy-page/policy-page';

export const PrivacyPolicyPage: React.FC = () => {
  return <PolicyPage data={data as PolicyData} />;
};
