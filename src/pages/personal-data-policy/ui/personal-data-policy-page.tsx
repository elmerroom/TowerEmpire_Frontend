import React from 'react';
import { PolicyPage } from '@/shared/ui/policy-page';
import data from '@/shared/assets/policies/personal-data-ru.json';
import { PolicyData } from '@/shared/ui/policy-page/policy-page';

export const PersonalDataPolicyPage: React.FC = () => {
  return <PolicyPage data={data as PolicyData} />;
};
