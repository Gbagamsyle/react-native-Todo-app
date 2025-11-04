import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoList } from '@/components/todo-list';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
  {/* only show the top gradient in dark theme; remove gradient for light theme per design */}
  {theme === 'dark' ? <View style={[styles.gradient, styles.gradientDark]} /> : null}
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>TODO</ThemedText>
          <TouchableOpacity onPress={toggleTheme} accessibilityLabel="Toggle theme">
            <MaterialIcons 
              name={theme === 'dark' ? 'light-mode' : 'dark-mode'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Header artwork (desktop/mobile variants) */}
        <View style={styles.artworkWrap} pointerEvents="none">
          <Image
            source={
              theme === 'dark'
                ? require('@/assets/images/Desktop - Dark.jpg')
                : require('@/assets/images/Desktop - Light.jpg')
            }
            style={styles.artwork}
            resizeMode="contain"
          />
        </View>

        {/* Main Card */}
        <ThemedView style={[styles.card, Platform.OS === 'web' && styles.cardDesktop]}>
          <View style={styles.cardInner}>
            <TodoList />
          </View>
        </ThemedView>

        {/* Bottom hint text */}
        <ThemedText style={styles.dragHint}>
          Drag and drop to reorder list
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? '20%' : 20,
    paddingTop: Platform.OS === 'web' ? 70 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 10,
    color: 'white',
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 30px rgba(0,0,0,0.15)',
      },
    }),
  },
  cardDesktop: {
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  cardInner: {
    padding: 20,
  },
  artworkWrap: {
    alignItems: 'center',
    marginBottom: 20,
    pointerEvents: 'none',
  },
  artwork: {
    width: '100%',
    maxWidth: 560,
    height: 140,
  },
  gradientLight: {
    backgroundColor: '#9FE8FF',
  },
  gradientDark: {
    backgroundColor: '#3B3A78',
  },
  dragHint: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.5,
    fontSize: 14,
  },
});
