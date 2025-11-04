import { ConvexProviderWrapper } from '@/context/ConvexProvider';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated from 'react-native-reanimated';
import * as styledComponents from 'styled-components/native';

const styled = styledComponents.default;

export const unstable_settings = {
  anchor: '(tabs)',
};

const Container = styled(Animated.View)`
  flex: 1;
  background-color: ${props => (props as any).theme.colors.background};
`;

export default function RootLayout() {
  return (
    <ConvexProviderWrapper>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ConvexProviderWrapper>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Container>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </Container>
    </NavigationThemeProvider>
  );
}
