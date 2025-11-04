import { useTheme } from '@/context/ThemeContext';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Todo } from '@/types/todo';
import { useMutation, useQuery } from 'convex/react';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
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

  // ===== Hooks must be at the top =====
  const todos = useQuery(api.todos.list);
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);
  const updateOrder = useMutation(api.todos.updateOrder);
  const clearCompleted = useMutation(api.todos.clearCompleted);

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
  const [removedIds, setRemovedIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [localOrder, setLocalOrder] = useState<Todo[] | null>(null);

  const cardBg = theme === 'dark' ? '#25273D' : '#ffffff';
  const shadowColor = theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';

  // ===== Merged todos (including optimistics, pending toggles, removed ids) =====
  const mergedTodos = useMemo(() => {
    if (!todos) return [];
    if (localOrder) return localOrder;

    const merged: Todo[] = [];
    if (optimisticAdds.length > 0) merged.push(...optimisticAdds);

    for (const t of todos) {
      const idStr = t._id as string;
      if (removedIds[idStr]) continue;
      if (optimisticAdds.some((ot) => ot._id === idStr)) continue;
      merged.push({ ...t, completed: pendingToggles[idStr] ?? t.completed });
    }
    return merged;
  }, [todos, optimisticAdds, removedIds, pendingToggles, localOrder]);

  // ===== Filtered todos based on search + filter =====
  const filteredTodos = useMemo(() => {
    let filtered = mergedTodos.filter(todo =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filter === 'active') filtered = filtered.filter(t => !t.completed);
    else if (filter === 'completed') filtered = filtered.filter(t => t.completed);

    return filtered;
  }, [mergedTodos, searchQuery, filter]);

  // ===== Drag & drop handler =====
  const handleDragEnd = useCallback(
    ({ data }: { data: Todo[] }) => {
      setLocalOrder(data);
      const updates = data.map((todo, index) => ({ id: todo._id as Id<'todos'>, order: index }));
      updateOrder({ items: updates }).finally(() => setLocalOrder(null));
    },
    [updateOrder]
  );

  // ===== Render each todo item =====
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Todo>) => (
      <ScaleDecorator>
        <View style={[isActive && styles.draggingItem, isActive && { backgroundColor: theme === 'dark' ? '#393A4B' : '#E3E4F1' }]}>
          <TodoItem
            todo={item}
            onToggle={(completed) => {
              const idStr = item._id as string;
              setPendingToggles((s) => ({ ...s, [idStr]: completed }));
              updateTodo({ id: item._id as Id<'todos'>, completed }).catch(() => {
                setPendingToggles((s) => {
                  const copy = { ...s };
                  delete copy[idStr];
                  return copy;
                });
              });
            }}
            onEdit={() => setEditingTodo(item)}
            onDelete={() => {
              const idStr = item._id as string;
              setRemovedIds((s) => ({ ...s, [idStr]: true }));
              deleteTodo({ id: item._id as Id<'todos'> }).catch(() => {
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
    ),
    [theme, updateTodo, deleteTodo]
  );

  // ===== Loading fallback =====
  if (!todos) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#FFF' : '#000'} />
        <ThemedText style={{ marginTop: 12 }}>Loading todos...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme === 'dark' ? '#171823' : '#F9FAFB' }]}>
      <View style={styles.centerWrapper}>
        <View style={[styles.card, { backgroundColor: cardBg, shadowColor }]}>
          <DraggableFlatList
            data={filteredTodos}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            extraData={{ pendingToggles, removedIds }}
          />

          <View style={[styles.footer, { backgroundColor: cardBg, borderTopColor: theme === 'dark' ? '#393A4B' : '#E3E4F1' }]}>
            <ThemedText style={[styles.footerLeft, { color: theme === 'dark' ? '#5B5E7E' : '#9495A5' }]}>
              {mergedTodos.filter((t) => !t.completed).length} items left
            </ThemedText>

            <View style={[styles.filterRow, { backgroundColor: cardBg }]}>
              <ThemedText style={[styles.filterText, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')}>
                All
              </ThemedText>
              <ThemedText style={[styles.filterText, filter === 'active' && styles.filterActive]} onPress={() => setFilter('active')}>
                Active
              </ThemedText>
              <ThemedText style={[styles.filterText, filter === 'completed' && styles.filterActive]} onPress={() => setFilter('completed')}>
                Completed
              </ThemedText>
            </View>

            <ThemedText style={[styles.footerRight, { color: theme === 'dark' ? '#5B5E7E' : '#9495A5' }]} onPress={() => clearCompleted()}>
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', minHeight: '100%', paddingTop: 0 },
  listContent: { paddingVertical: 0 },
  draggingItem: { opacity: 0.9, transform: [{ scale: 1.04 }], borderRadius: 8 },
  centerWrapper: { alignItems: 'center', width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 540, borderRadius: 10, overflow: 'hidden', backgroundColor: '#FFF', shadowColor: 'rgba(58, 124, 253, 0.12)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8, marginTop: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 0, paddingVertical: 18, borderTopWidth: 1, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginBottom: 8 },
  footerLeft: { fontSize: 14, color: '#9495A5', letterSpacing: -0.19 },
  footerRight: { fontSize: 14, color: '#9495A5', letterSpacing: -0.19, paddingLeft: 12 },
  filterRow: { flexDirection: 'row', borderRadius: 20, backgroundColor: 'transparent', paddingVertical: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
  filterText: { marginHorizontal: 8, fontSize: 14, color: '#9495A5', fontWeight: '500', paddingVertical: 6, backgroundColor: 'transparent', overflow: 'hidden' },
  filterActive: { fontWeight: '700', shadowColor: '#3A7CFD', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  dragHint: { textAlign: 'center', color: '#9495A5', fontSize: 13, marginTop: 12, marginBottom: 0, opacity: 0.7 },
});
