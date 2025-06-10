import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const ITEM_WIDTH = (width - 60) / 2;

export const CATEGORY_ICONS = {
  'Work': 'briefcase-outline',
  'Personal': 'person-outline',
  'Health': 'fitness-outline',
  'Shopping': 'cart-outline',
  'Home': 'home-outline',
  'Education': 'school-outline',
  'Finance': 'wallet-outline',
  'Travel': 'airplane-outline',
  'Other': 'apps-outline'
};

export const CATEGORY_COLORS = [
  ['#FF9966', '#FF5E62'], 
  ['#56CCF2', '#2F80ED'], 
  ['#A18CD1', '#FBC2EB'], 
  ['#84FAB0', '#8FD3F4'], 
  ['#FCCF31', '#F55555'], 
  ['#6A11CB', '#2575FC'], 
  ['#FF9A9E', '#FECFEF'], 
  ['#43E97B', '#38F9D7']  
];