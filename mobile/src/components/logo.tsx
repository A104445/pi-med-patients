import { SvgXml } from 'react-native-svg';

import { Colors } from '@/constants/theme';

import { LOGO_PATIENTS_XML } from './logo-xml';

// Proporção do viewBox do SVG (largura / altura).
const ASPECT_RATIO = 348.105 / 164.065;

type Props = {
  width?: number;
  color?: string;
};

export function Logo({ width = 200, color = Colors.primary }: Props) {
  return (
    <SvgXml
      xml={LOGO_PATIENTS_XML}
      width={width}
      height={width / ASPECT_RATIO}
      color={color}
      accessibilityLabel="Medgical Patients"
    />
  );
}
