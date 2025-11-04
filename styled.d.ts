import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      text: string;
      background: string;
      tint: string;
      icon: string;
      tabIconDefault: string;
      tabIconSelected: string;
    };
  }
}
