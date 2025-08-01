import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "@/hooks/auth-store";
import { IEPProvider } from "@/hooks/iep-store";
import { MessagingProvider } from "@/hooks/messaging-store";
import { CaseProvider } from "@/hooks/case-store";
import { AuditProvider } from "@/hooks/audit-store";
import { AdvocateProvider } from "@/hooks/advocate-store";
import { SchedulingProvider } from "@/hooks/scheduling-store";
import { FeedbackProvider } from "@/hooks/feedback-store";
import Colors from "@/constants/colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
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
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Information",
        }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          presentation: "modal",
          title: "Feedback",
        }}
      />
      <Stack.Screen
        name="feedback-history"
        options={{
          title: "Feedback History",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FeedbackProvider>
          <AuditProvider>
            <IEPProvider>
              <CaseProvider>
                <AdvocateProvider>
                  <SchedulingProvider>
                    <MessagingProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <StatusBar style="auto" />
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </MessagingProvider>
                  </SchedulingProvider>
                </AdvocateProvider>
              </CaseProvider>
            </IEPProvider>
          </AuditProvider>
        </FeedbackProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}