import { Tabs } from "expo-router";
import React from "react";
import { useAuth } from "@/hooks/auth-store";
import { useMessaging } from "@/hooks/messaging-store";
import Colors from "@/constants/colors";
import { Home, Users, MessageSquare, FileText, Settings } from "lucide-react-native";

export default function TabLayout() {
  const { user, isParent, isAdvocate } = useAuth();
  const { getUnreadCount } = useMessaging();
  
  const unreadCount = getUnreadCount();
  
  if (!user) {
    return null; // Will redirect to auth in useEffect
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      {isParent && (
        <Tabs.Screen
          name="children"
          options={{
            title: "Children",
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
      )}
      
      {isAdvocate && (
        <Tabs.Screen
          name="cases"
          options={{
            title: "Cases",
            tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          }}
        />
      )}
      
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}