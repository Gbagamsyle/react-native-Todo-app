import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
 
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddTodoProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit?: (args: { title: string; description: string; dueDate?: number }) => Promise<any>;
}

export const AddTodo: React.FC<AddTodoProps> = ({ isVisible, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);

    // Normalize due date to UTC midnight
    let normalizedDueDate: number | undefined = undefined;
    if (dueDate) {
      const utc = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
      normalizedDueDate = utc.getTime();
    }

    try {
      if (onSubmit) {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          dueDate: normalizedDueDate,
        });
      }

      setTitle('');
      setDescription('');
      setDueDate(null);
      onClose();
    } catch (error) {
      console.error('Failed to create todo', error);
      // could show toast
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // For web, event.type may be undefined, so always check selectedDate
    if ((event.type === 'set' || event.type === undefined) && selectedDate) {
      setDueDate(selectedDate);
      setShowDatePicker(Platform.OS === 'ios');
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

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
            <ThemedText style={styles.headerText}>Add New Todo</ThemedText>
            <TouchableOpacity onPress={onClose}>
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

          {Platform.OS === 'web' ? (
            <View style={[styles.dateButton, { borderColor: colors.text }]}>
              <MaterialIcons name="event" size={24} color={colors.text} />
              <input
                type="date"
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  flex: 1,
                  border: 'none',
                  padding: 0,
                  color: colors.text,
                  backgroundColor: 'transparent',
                }}
                value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setDueDate(date);
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </View>
          ) : (
            <>
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
            </>
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Todo'}</ThemedText>
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
  dateInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
    borderWidth: 0,
    padding: 0,
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