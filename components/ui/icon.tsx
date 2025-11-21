import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as React from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

export type IconLibrary = 'ionicons' | 'material' | 'feather' | 'fontawesome' | 'antdesign';
export type IconName = 
  | keyof typeof Ionicons.glyphMap
  | keyof typeof MaterialIcons.glyphMap
  | keyof typeof Feather.glyphMap
  | keyof typeof FontAwesome.glyphMap
  | keyof typeof AntDesign.glyphMap;

export interface IconProps {
  name: IconName;
  library?: IconLibrary;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const Icon = React.forwardRef<any, IconProps>(
  ({ name, library = 'ionicons', size = 24, color, style, ...props }, ref) => {
    const iconProps = {
      name: name as any,
      size,
      color,
      style,
      ...props,
    };

    switch (library) {
      case 'ionicons':
        return <Ionicons ref={ref} {...iconProps} />;
      case 'material':
        return <MaterialIcons ref={ref} {...iconProps} />;
      case 'feather':
        return <Feather ref={ref} {...iconProps} />;
      case 'fontawesome':
        return <FontAwesome ref={ref} {...iconProps} />;
      case 'antdesign':
        return <AntDesign ref={ref} {...iconProps} />;
      default:
        return <Ionicons ref={ref} {...iconProps} />;
    }
  }
);
Icon.displayName = 'Icon';

export { Icon };

