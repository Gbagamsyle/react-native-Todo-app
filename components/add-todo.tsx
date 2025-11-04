import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
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
  const { colors, theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <ThemedView
          style={[
            styles.modalContent,
            { backgroundColor: theme === 'dark' ? '#171823' : '#ffffff' },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <ThemedText style={styles.headerText}>Add New Todo</ThemedText>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.text }]}
              placeholder="Title"
              placeholderTextColor={theme === 'dark' ? colors.icon : '#9495A5'}
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
              placeholderTextColor={theme === 'dark' ? colors.icon : '#9495A5'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Date Picker */}
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
                  onChange={(e) => setDueDate(new Date(e.target.value))}
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
                  <ThemedText style={[styles.dateButtonText, { color: colors.text }]}>
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
  style={[
    styles.addButton,
    {
      backgroundColor: theme === 'dark' ? '#3A7CFD' : colors.tint, // bright blue in dark mode
    },
  ]}
  onPress={handleSubmit}
  disabled={loading}
>
  <ThemedText
    style={[
      styles.addButtonText,
      {
        color: '#fff', // white text for readability
      },
    ]}
  >
    {loading ? 'Adding...' : 'Add Todo'}
  </ThemedText>
</TouchableOpacity>

          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scrollContent: {
    paddingBottom: 40,
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
    color: 'white',
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
    fontSize: 16,
    fontWeight: '600',
  },
});
