import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/convex/_generated/api';
import { Todo } from '@/types/todo';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditTodoProps {
  isVisible: boolean;
  onClose: () => void;
  todo: Todo | null;
}

export const EditTodo: React.FC<EditTodoProps> = ({ isVisible, onClose, todo }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateTodo = useMutation(api.todos.update);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setDescription(todo.description || '');
      setDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    }
  }, [todo]);

  const handleSubmit = async () => {
    if (!todo) return;
    if (!title.trim()) return;

    // Normalize due date to UTC midnight
    let normalizedDueDate: number | undefined = undefined;
    if (dueDate) {
      const utc = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
      normalizedDueDate = utc.getTime();
    }

    setLoading(true);
    try {
      await updateTodo({
        id: todo._id,
        title: title.trim(),
        description: description.trim(),
        dueDate: normalizedDueDate,
      });
      onClose();
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  if (!todo) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>Edit Todo</ThemedText>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close edit modal">
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.text}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { color: colors.text, borderColor: colors.text },
            ]}
            placeholder="Description"
            placeholderTextColor={colors.text}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.text }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="event" size={24} color={colors.text} />
            <ThemedText style={styles.dateButtonText}>
              {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}
            </ThemedText>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.addButtonText}>{loading ? 'Saving...' : 'Save Changes'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
