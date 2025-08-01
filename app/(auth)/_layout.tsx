import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Create Account",
        }}
      />
      <Stack.Screen
        name="waitlist"
        options={{
          title: "Join Waitlist",
        }}
      />
    </Stack>
  );
}