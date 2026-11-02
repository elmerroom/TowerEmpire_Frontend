import { CSSProperties } from 'react';

interface BtnIconProps {
  src: string;
  size?: number;
  style?: CSSProperties;
}

export const BtnIcon = ({ src, size = 18, style }: BtnIconProps) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      marginLeft: 12,
      flexShrink: 0,
      borderRadius: 0,
      ...style,
    }}
  />
);
