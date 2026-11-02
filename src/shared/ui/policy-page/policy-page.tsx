import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './policy-page.module.scss';
import { Button } from '@/shared/ui/Button';

export interface PolicySection {
  type: 'h2' | 'p' | 'ul' | 'subtitle';
  text?: string;
  items?: string[];
}

export interface PolicyData {
  title: string;
  body: PolicySection[];
}

interface PolicyPageProps {
  data: PolicyData;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ data }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.policyPage}>
      <div className={styles.header}>
        <Button onClick={handleBack}>&larr; Назад / Back</Button>
      </div>
      <div className={styles.container}>
        <h1 className={styles.title}>{data.title}</h1>
        <div className={styles.content}>
          {data.body.map((section, index) => {
            switch (section.type) {
              case 'subtitle':
                return (
                  <p
                    key={index}
                    className={styles.subtitle}
                    dangerouslySetInnerHTML={{ __html: section.text || '' }}
                  />
                );
              case 'h2':
                return <h2 key={index}>{section.text}</h2>;
              case 'p':
                return (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{ __html: section.text || '' }}
                  />
                );
              case 'ul':
                return (
                  <ul key={index}>
                    {section.items?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
};
