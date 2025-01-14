import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config'; // Adjust the import path
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MeetingTimeModal = ({ visible, onClose, onSelect, doctorId }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
        if (doctorDoc.exists()) {
          const doctorData = doctorDoc.data();
          setAvailability(doctorData.availability || []);
        } else {
          console.log('No such doctor found!');
        }
      } catch (error) {
        console.error('Error fetching availability: ', error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    if (visible && doctorId) {
      fetchAvailability();
    }
  }, [visible, doctorId, fadeAnim]);

  const renderTimeSlot = ({ item }) => {
    const [day, time] = item.split(' ');
    return (
      <TouchableOpacity
        style={styles.timeSlot}
        onPress={() => onSelect(item)}
      >
        <View style={styles.dayContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={24} color="#E91E63" />
          <Text style={styles.dayText}>{day}</Text>
        </View>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#E91E63" />
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          <Text style={styles.modalTitle}>Select a Time Slot</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#E91E63" />
          ) : availability.length > 0 ? (
            <FlatList
              data={availability}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.timeSlotsContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noSlotsContainer}>
              <MaterialCommunityIcons name="calendar-remove" size={48} color="#E91E63" />
              <Text style={styles.noSlotsText}>No available time slots.</Text>
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  timeSlotsContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFF5F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 8,
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E91E63',
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default MeetingTimeModal;