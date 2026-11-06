export const colors = {
  primary: '#F8B4C4',
  primaryDark: '#E891A8',
  secondary: '#C9A8E0',
  secondaryDark: '#A883C7',
  accent: '#7DD3C8',
  accentDark: '#5BBFB2',
  cream: '#FFF9F5',
  white: '#FFFFFF',
  background: '#FDF7F9',
  text: '#3D2C3E',
  textLight: '#7A6878',
  textMuted: '#A898A6',
  border: '#F0E4EA',
  success: '#7BC67E',
  warning: '#F5C26B',
  danger: '#E88A8A',
  info: '#8BB8E8',
  cardShadow: 'rgba(168, 131, 199, 0.12)',
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const borderRadius = {
  sm: 8, md: 12, lg: 16, xl: 24, pill: 999,
};

export const shadows = {
  soft: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#C9A8E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const fonts = {
  regular: 'Vazirmatn-Regular',
  bold: 'Vazirmatn-Bold',
};