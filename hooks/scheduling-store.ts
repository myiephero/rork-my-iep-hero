import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-store';

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  advocateId: string;
}

export interface CallAppointment {
  id: string;
  parentId: string;
  advocateId: string;
  childId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  title: string;
  description?: string;
  meetingLink?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  notes?: string;
}

// Mock time slots for the next 7 days
const generateMockTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const advocateIds = ['2', 'adv-2'];
  
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends for this example
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    advocateIds.forEach(advocateId => {
      // Morning slots (9 AM - 12 PM)
      for (let hour = 9; hour < 12; hour++) {
        slots.push({
          id: `slot-${advocateId}-${dateStr}-${hour}`,
          date: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: Math.random() > 0.3, // 70% chance of being available
          advocateId
        });
      }
      
      // Afternoon slots (1 PM - 5 PM)
      for (let hour = 13; hour < 17; hour++) {
        slots.push({
          id: `slot-${advocateId}-${dateStr}-${hour}`,
          date: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: Math.random() > 0.4, // 60% chance of being available
          advocateId
        });
      }
    });
  }
  
  return slots;
};

// Mock appointments
const mockAppointments: CallAppointment[] = [
  {
    id: 'appt-1',
    parentId: '1',
    advocateId: '2',
    childId: 'child-1',
    date: '2025-07-29',
    startTime: '14:00',
    endTime: '15:00',
    type: 'video',
    status: 'confirmed',
    title: 'IEP Review Discussion',
    description: 'Review current IEP goals and discuss upcoming annual meeting',
    meetingLink: 'https://meet.example.com/iep-review-123',
    createdAt: '2025-07-28T10:00:00Z',
    updatedAt: '2025-07-28T10:00:00Z',
    reminders: {
      email: true,
      sms: true,
      push: true
    },
    notes: 'Please have current IEP document ready for review'
  }
];

export const [SchedulingProvider, useScheduling] = createContextHook(() => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<CallAppointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load mock data
        setTimeSlots(generateMockTimeSlots());
        setAppointments(mockAppointments);
        
      } catch (err) {
        console.error('Failed to load scheduling data:', err);
        setError('Failed to load scheduling data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getAvailableSlots = (advocateId: string, date?: string) => {
    return timeSlots.filter(slot => 
      slot.advocateId === advocateId && 
      slot.isAvailable &&
      (!date || slot.date === date)
    );
  };

  const getUserAppointments = (userId: string) => {
    return appointments.filter(appt => 
      appt.parentId === userId || appt.advocateId === userId
    ).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getUpcomingAppointments = (userId: string, limit: number = 5) => {
    const now = new Date();
    return getUserAppointments(userId)
      .filter(appt => {
        const apptDate = new Date(`${appt.date}T${appt.startTime}`);
        return apptDate > now && appt.status !== 'cancelled';
      })
      .slice(0, limit);
  };

  const scheduleAppointment = async (
    advocateId: string,
    childId: string,
    slotId: string,
    type: 'video' | 'phone',
    title: string,
    description?: string
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const slot = timeSlots.find(s => s.id === slotId);
      if (!slot || !slot.isAvailable) {
        throw new Error('Time slot not available');
      }
      
      const newAppointment: CallAppointment = {
        id: `appt-${Date.now()}`,
        parentId: user.id,
        advocateId,
        childId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type,
        status: 'scheduled',
        title,
        description,
        meetingLink: type === 'video' ? `https://meet.example.com/call-${Date.now()}` : undefined,
        phoneNumber: type === 'phone' ? '+1-555-0123' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminders: {
          email: true,
          sms: true,
          push: true
        }
      };
      
      // Update appointments
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      
      // Mark slot as unavailable
      const updatedSlots = timeSlots.map(s => 
        s.id === slotId ? { ...s, isAvailable: false } : s
      );
      setTimeSlots(updatedSlots);
      
      // Save to storage
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      await AsyncStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule appointment';
      setError(errorMessage);
      throw err;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error('Appointment not found');
      
      // Update appointment status
      const updatedAppointments = appointments.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
          : appt
      );
      setAppointments(updatedAppointments);
      
      // Make the slot available again
      const slotId = `slot-${appointment.advocateId}-${appointment.date}-${appointment.startTime.split(':')[0]}`;
      const updatedSlots = timeSlots.map(slot => 
        slot.id === slotId ? { ...slot, isAvailable: true } : slot
      );
      setTimeSlots(updatedSlots);
      
      // Save to storage
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      await AsyncStorage.setItem('timeSlots', JSON.stringify(updatedSlots));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(errorMessage);
      throw err;
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    try {
      const updatedAppointments = appointments.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, status: 'confirmed' as const, updatedAt: new Date().toISOString() }
          : appt
      );
      setAppointments(updatedAppointments);
      
      await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      return true;
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
      setError('Failed to confirm appointment');
      throw err;
    }
  };

  const getAppointmentById = (appointmentId: string) => {
    return appointments.find(appt => appt.id === appointmentId) || null;
  };

  return {
    timeSlots,
    appointments,
    isLoading,
    error,
    getAvailableSlots,
    getUserAppointments,
    getUpcomingAppointments,
    scheduleAppointment,
    cancelAppointment,
    confirmAppointment,
    getAppointmentById
  };
});