import { useTheme } from '@/context/ThemeContext';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Todo } from '@/types/todo';
import { useMutation, useQuery } from 'convex/react';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator
} from 'react-native-draggable-flatlist';
import { EditTodo } from './edit-todo';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { TodoItem } from './todo-item';

interface TodoListProps {
  searchQuery?: string;
  optimisticAdds?: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({ searchQuery = '', optimisticAdds = [] }) => {
  const { theme } = useTheme();
  const todos = (useQuery(api.todos.list) || []) as Todo[];
  const cardBg = theme === 'dark' ? '#25273D' : '#ffffff';
  const shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);
  const updateOrder = useMutation(api.todos.updateOrder);
  const clearCompleted = useMutation(api.todos.clearCompleted);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
  const [removedIds, setRemovedIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [localOrder, setLocalOrder] = useState<Todo[] | null>(null);

  // merge optimistic adds at the front, exclude removed ids, and apply pending toggle overrides
  let mergedTodos: Todo[] = [];
  if (localOrder) {
    mergedTodos = localOrder;
  } else {
    if (optimisticAdds && optimisticAdds.length > 0) {
      mergedTodos.push(...optimisticAdds);
    }
    for (const t of todos) {
      if (removedIds[(t._id as any) as string]) continue;
      // skip if optimistic add has same id
      if (optimisticAdds && optimisticAdds.some((ot: Todo) => ot._id === (t._id as any))) continue;
      const overridden: Todo = {
        ...t,
        completed: pendingToggles[(t._id as any) as string] ?? t.completed,
      } as Todo;
      mergedTodos.push(overridden);
    }
  }

  let filteredTodos = mergedTodos.filter((todo: Todo) =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filter === 'active') {
    filteredTodos = filteredTodos.filter((todo) => !todo.completed);
  } else if (filter === 'completed') {
    filteredTodos = filteredTodos.filter((todo) => todo.completed);
  }

  const handleDragEnd = ({ data }: { data: Todo[] }) => {
    setLocalOrder(data); // optimistic update
    const updates = data.map((todo, index) => ({
      id: todo._id as Id<'todos'>,
      order: index,
    }));
    updateOrder({ items: updates }).finally(() => {
      setLocalOrder(null); // reset to server order after mutation
    });
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => {
    return (
      <ScaleDecorator>
        <View style={[
          isActive && styles.draggingItem,
          isActive && { backgroundColor: theme === 'dark' ? '#393A4B' : '#E3E4F1' }
        ]}>
          <TodoItem
            todo={item}
            onToggle={(completed) => {
              // optimistic toggle
              const idStr = (item._id as any) as string;
              setPendingToggles((s) => ({ ...s, [idStr]: completed }));
              updateTodo({ id: item._id as Id<'todos'>, completed }).catch((err) => {
                console.error('Toggle failed', err);
                // revert
                setPendingToggles((s) => {
                  const copy = { ...s };
                  delete copy[idStr];
                  return copy;
                });
              });
            }}
            onEdit={() => setEditingTodo(item)}
            onDelete={() => {
              const idStr = (item._id as any) as string;
              // optimistic remove
              setRemovedIds((s) => ({ ...s, [idStr]: true }));
              deleteTodo({ id: item._id as Id<'todos'> }).catch((err) => {
                console.error('Delete failed', err);
                setRemovedIds((s) => {
                  const copy = { ...s };
                  delete copy[idStr];
                  return copy;
                });
              });
            }}
            onLongPress={drag}
          />
        </View>
      </ScaleDecorator>
    );
  };



  return (
    <ThemedView style={[styles.container, { backgroundColor: theme === 'dark' ? '#171823' : '#F9FAFB' }]}>
      <View style={[styles.centerWrapper]}>
        <View style={[styles.card, { backgroundColor: cardBg, shadowColor }]}>
          <DraggableFlatList
            data={filteredTodos}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          <View style={[
            styles.footer, 
            { 
              backgroundColor: cardBg,
              borderTopColor: theme === 'dark' ? '#393A4B' : '#E3E4F1'
            }
          ]}>
            <ThemedText 
              style={[
                styles.footerLeft,
                { color: theme === 'dark' ? '#5B5E7E' : '#9495A5' }
              ]}
            >
              {mergedTodos.filter((t) => !t.completed).length} items left
            </ThemedText>

            <View style={[styles.filterRow, { backgroundColor: cardBg }]}>
              <ThemedText style={[styles.filterText, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')} accessibilityRole="button" accessibilityState={{ selected: filter === 'all' }}>All</ThemedText>
              <ThemedText style={[styles.filterText, filter === 'active' && styles.filterActive]} onPress={() => setFilter('active')} accessibilityRole="button" accessibilityState={{ selected: filter === 'active' }}>Active</ThemedText>
              <ThemedText style={[styles.filterText, filter === 'completed' && styles.filterActive]} onPress={() => setFilter('completed')} accessibilityRole="button" accessibilityState={{ selected: filter === 'completed' }}>Completed</ThemedText>
            </View>

            <ThemedText 
              style={[
                styles.footerRight,
                { color: theme === 'dark' ? '#5B5E7E' : '#9495A5' }
              ]} 
              onPress={() => clearCompleted()} 
              accessibilityRole="button"
            >
              Clear Completed
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.dragHint}>Drag and drop to reorder list</ThemedText>
      </View>

      <EditTodo isVisible={!!editingTodo} todo={editingTodo} onClose={() => setEditingTodo(null)} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100%',
    paddingTop: 0, // Removed padding since header is in parent
  },
  listContent: {
    paddingVertical: 0,
  },
    draggingItem: {
    opacity: 0.9,
    transform: [{ scale: 1.04 }],
    borderRadius: 8,
  },
  centerWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: 'rgba(58, 124, 253, 0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 8,
  },
  footerLeft: {
    fontSize: 14,
    color: '#9495A5',
    letterSpacing: -0.19,
  },
  footerRight: {
    fontSize: 14,
    color: '#9495A5',
    letterSpacing: -0.19,
    paddingLeft: 12,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    marginTop: 0,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  filterText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#9495A5',
    fontWeight: '500',
    paddingVertical: 6,
    // borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  filterActive: {
    fontWeight: '700',
    shadowColor: '#3A7CFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  dragHint: {
    textAlign: 'center',
    color: '#9495A5',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 0,
    opacity: 0.7,
  },
});