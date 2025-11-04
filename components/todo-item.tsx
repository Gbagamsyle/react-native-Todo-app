import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { Todo } from '@/types/todo';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';


export interface TodoItemProps {
  todo: Todo;
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onEdit, onDelete, onLongPress }) => {
  const { colors, theme } = useTheme();
  const borderColor = theme === 'dark' ? '#393A4B' : '#E3E4F1';

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={[
          styles.actionButton, 
          { backgroundColor: colors.tint }
        ]}
        onPress={onEdit}
      >
        <MaterialIcons name="edit" size={18} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionButton, 
          { backgroundColor: '#FF4444' }
        ]}
        onPress={onDelete}
      >
        <MaterialIcons name="delete" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={onLongPress}
      >
        <ThemedView 
          style={[
            styles.container,
            { 
              borderBottomColor: borderColor,
              backgroundColor: theme === 'dark' ? '#25273D' : '#ffffff'
            }
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onToggle(!todo.completed)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: todo.completed ? '#3A7CFD' : 'transparent',
                  borderColor: todo.completed ? '#3A7CFD' : theme === 'dark' ? '#393A4B' : '#E3E4F1',
                },
              ]}
            >
              {todo.completed && (
                <MaterialIcons name="check" size={12} color="white" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <ThemedText
              style={[
                styles.title,
                { color: theme === 'dark' ? '#C8CBE7' : '#494C6B' },
                todo.completed && { 
                  textDecorationLine: 'line-through',
                  color: theme === 'dark' ? '#4D5067' : '#D1D2DA',
                  opacity: theme === 'dark' ? 0.3 : 0.5
                },
              ]}
            >
              {todo.title}
            </ThemedText>
            {todo.description ? (
              <ThemedText 
                style={[
                  styles.description,
                  { 
                    color: theme === 'dark' ? '#5B5E7E' : '#9495A5',
                    opacity: theme === 'dark' ? 0.4 : 0.6
                  }
                ]}
              >
                {todo.description}
              </ThemedText>
            ) : null}
            {todo.dueDate && (
              <ThemedText 
                style={[
                  styles.date,
                  { 
                    color: theme === 'dark' ? '#5B5E7E' : '#9495A5',
                    opacity: theme === 'dark' ? 0.4 : 0.6
                  }
                ]}
              >
                Due: {format(todo.dueDate, 'MMM d, yyyy')}
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E4F1',
    position: 'relative',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
  },
  checkboxContainer: {
    marginRight: 20,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E3E4F1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transitionProperty: 'background-color',
    transitionDuration: '0.2s',
    boxShadow: '0 2px 8px rgba(58,124,253,0.08)',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.25,
    color: '#494C6B',
    transitionProperty: 'color',
    transitionDuration: '0.2s',
  },
  description: {
    fontSize: 12,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    height: '100%',
    paddingVertical: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginHorizontal: 6,
    paddingHorizontal: 8,
    backgroundColor: '#3A7CFD',
    elevation: 2,
  },
});