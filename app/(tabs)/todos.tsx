import { AddTodo } from '@/components/add-todo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoList } from '@/components/todo-list';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/convex/_generated/api';
import { Todo } from '@/types/todo';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function TodosScreen() {
  const [isAddVisible, setAddVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, colors, toggleTheme } = useTheme();
  const [optimisticAdds, setOptimisticAdds] = useState<Todo[]>([]);
  const createTodo = useMutation(api.todos.create);

  const handleCreate = async ({ title, description, dueDate }: { title: string; description: string; dueDate?: number }) => {
    // create a temporary todo to show immediately
    const tempId = `temp-${Date.now()}` as any;
    const tempTodo: Todo = {
      _id: tempId,
      _creationTime: Date.now(),
      title,
      description,
      completed: false,
      dueDate: dueDate,
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Todo;

    setOptimisticAdds((s) => [tempTodo, ...s]);

    try {
      await createTodo({ title, description, dueDate });
    } catch (err) {
      console.error('Create failed', err);
      // remove temp on error
      setOptimisticAdds((s) => s.filter((t) => t._id !== tempId));
      throw err;
    } finally {
      // remove temp after server should have added the real item
      setTimeout(() => {
        setOptimisticAdds((s) => s.filter((t) => t._id !== tempId));
      }, 1500);
    }
  };

  const overlayColor = theme === 'dark' ? 'rgba(37, 39, 60, 0.4)' : 'rgba(255,255,255,0.2)';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <Image
        source={
          theme === 'dark'
            ? require('@/assets/images/dark-purple-bg.jpg')
            : Platform.OS === 'web'
              ? require('@/assets/images/Bitmap-4.jpg')
              : require('@/assets/images/Bitmap-3.jpg')
        }
        style={[
          styles.headerImage,
          theme === 'dark' && { opacity: 0.9 } // Slightly dim the dark mode image
        ]}
        contentFit="cover"
      />

      <View
        style={[
          styles.header,
          { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 0 },
          Platform.OS === 'web' ? { marginTop: 70 } : { marginTop: 48 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center',width: '100%', justifyContent: 'space-between' }}>
          <ThemedText
            type="title"
            style={[
              styles.titleOverImage,
              {
                color: '#fff',
                fontSize:
                  Platform.OS === 'web'
                    ? 40
                    : screenWidth < 400
                      ? 20
                      : 26,
                letterSpacing:
                  Platform.OS === 'web'
                    ? 15
                    : screenWidth < 400
                      ? 8
                      : 12,
                fontWeight: '700',
                textTransform: 'uppercase',
                marginRight: 16,
              },
            ]}
          >
            Todo
          </ThemedText>
          <TouchableOpacity
            style={[styles.iconButton, { marginRight: 0, marginLeft: 0 }]}
            onPress={toggleTheme}
            accessibilityLabel={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Image
              source={
                theme === 'dark'
                  ? require('@/assets/images/icon-dark.svg')
                  : require('@/assets/images/icon-light.svg')
              }
              style={{ width: 26, height: 26 }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* overlay to increase contrast over the image (only in dark theme) */}
      {theme === 'dark' && (
        <View style={[styles.headerOverlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
      )}

      <View style={[
        styles.searchRow,
        { alignItems: 'center', justifyContent: 'center', width: '100%',
          marginTop: Platform.OS === 'web' ? 48 : (screenWidth < 400 ? 12 : -36)
        }
      ]}> 
        <View style={[styles.searchBox, { backgroundColor: theme === 'dark' ? '#25273D' : '#ffffff', maxWidth: 540, width: '100%' }]}> 
          <MaterialIcons name="radio-button-unchecked" size={24} color={theme === 'dark' ? '#393A4B' : '#E3E4F1'} />
          <TextInput
            placeholder="Create a new todo..."
            placeholderTextColor={theme === 'dark' ? '#6B7680' : '#9495A5'}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Create a new todo"
          />
          <TouchableOpacity
            style={[styles.addButtonInline]}
            onPress={() => setAddVisible(true)}
            accessibilityLabel="Add todo"
          >
            <MaterialIcons name="add" size={24} color={theme === 'dark' ? '#6B7680' : '#9495A5'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listWrapper}>
        <TodoList searchQuery={searchQuery} optimisticAdds={optimisticAdds} />
        
        <ThemedText style={styles.dragHint}>
          Drag and drop to reorder list
        </ThemedText>
      </View>

      <AddTodo isVisible={isAddVisible} onClose={() => setAddVisible(false)} onSubmit={handleCreate} />
    </ThemedView>
  );
}

const HEADER_IMAGE_HEIGHT = Platform.OS === 'web' ? 300 : 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
  },
  headerImage: {
    height: HEADER_IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: Platform.OS === 'web' ? 0 : -20,
    right: Platform.OS === 'web' ? 0 : -20,
  },
  header: {
  zIndex: 10,
  position: 'relative',
  marginTop: Platform.OS === 'web' ? 70 : 48,

  width: '100%',
  maxWidth: 540,          // same as search bar width (key)
  alignSelf: 'center',    // center it (key)
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingHorizontal: 0,
  paddingBottom: 8,
},

  addButton: {
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchRow: {
    marginTop: Platform.OS === 'web' ? 48 : -36,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  titleWrap: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
    paddingHorizontal: 18,
    borderRadius: Platform.OS === 'web' ? 8 : 12,
    borderWidth: 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 540 : '100%',
    backgroundColor: '#FFF',
    // subtle box shadow to match design
    shadowColor: 'rgba(18,18,30,0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    height: Platform.OS === 'web' ? 24 : 20,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#494C6B',
    fontWeight: '400',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_IMAGE_HEIGHT,
    zIndex: 2,
  },
  listWrapper: {
    flex: 1,
    marginTop: 16,
    alignItems: 'center',
    // paddingHorizontal: Platform.OS === 'web' ? 24 : 20,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  titleOverImage: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
  },
  addButtonInline: {
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 5,
    marginLeft: 12,
  },
  dragHint: {
    marginTop: Platform.OS === 'web' ? 40 : 32,
    marginBottom: Platform.OS === 'web' ? 50 : 40,
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#9495A5',
    textAlign: 'center',
    opacity: 0.7,
  },
});
