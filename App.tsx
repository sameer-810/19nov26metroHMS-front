import React, { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  NavigationContainer,
  type LinkingOptions,
  type NavigatorScreenParams,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import RootNavigator from "@navigation/RootNavigator";
import { palette } from "@shared/designSystem";
import { queryClient } from "@api/queryClient";
import { startNetworkWatch } from "@shared/offline/network";
import { registerServiceWorker } from "@shared/offline/serviceWorker";

void SplashScreen.preventAutoHideAsync();

// route params for every addressable screen; the linking table below is checked against them.
// which of these is registered at runtime depends on permissions (see navItems.ts).
type InpatientParamList = {
  WardBoard: { mode?: "ward" | "icu" | "mine" } | undefined;
  Bedside: {
    admissionId: string;
    tab?: "chart" | "observations" | "drugs" | "notes";
  };
  AdmitPatient: { patientId?: string; consultationId?: string } | undefined;
  Discharge: { admissionId: string };
  MedicalRecord: { patientId: string };
  PatientDetail: { patientId: string };
};

type HandoverParamList = {
  HandoverList: undefined;
  Bedside: InpatientParamList["Bedside"];
  MedicalRecord: { patientId: string };
  PatientDetail: { patientId: string };
};

type LaboratoryParamList = {
  LabQueueList: undefined;
  LabResultsList: undefined;
  LabOrder: { orderId: string };
  MedicalRecord: { patientId: string };
  PatientDetail: { patientId: string };
};

type PharmacyParamList = {
  PharmacyQueueList: undefined;
  Dispense: { prescriptionId: string };
};

type StockParamList = {
  InventoryList: undefined;
  InventoryItem: { itemId: string };
  ReceiveStock: undefined;
  IssueStock: undefined;
  LowStock: undefined;
  StockLedger: undefined;
};

type BillingParamList = {
  BillsList: undefined;
  GenerateBill: { patientId?: string } | undefined;
  BillDetail: { billId: string };
  RecordPayment: { billId: string };
  Receipt: { paymentId: string };
  RefundSlip: { refundId: string };
  Outstanding: undefined;
};

type EmergencyParamList = {
  EmergencyBoard: undefined;
  RegisterArrival: undefined;
  EmergencyVisit: { visitId: string };
  MedicalRecord: { patientId: string };
};

type AppParamList = {
  Dashboard: undefined;
  Patients: undefined;
  RegisterPatient: undefined;
  Appointments: undefined;
  OpdQueue: undefined;
  Emergency: NavigatorScreenParams<EmergencyParamList> | undefined;
  MyAppointments: undefined;
  MyPatients: NavigatorScreenParams<InpatientParamList> | undefined;
  Consultation: { patientId: string };
  MedicalRecord: { patientId: string };
  AdmittedPatients: NavigatorScreenParams<InpatientParamList> | undefined;
  Beds: undefined;
  Icu: NavigatorScreenParams<InpatientParamList> | undefined;
  NursingPatients: NavigatorScreenParams<InpatientParamList> | undefined;
  Handover: NavigatorScreenParams<HandoverParamList> | undefined;
  LabQueue: NavigatorScreenParams<LaboratoryParamList> | undefined;
  LabReports: NavigatorScreenParams<LaboratoryParamList> | undefined;
  PharmacyQueue: NavigatorScreenParams<PharmacyParamList> | undefined;
  MedicineStock: NavigatorScreenParams<StockParamList> | undefined;
  Formulary: undefined;
  Inventory: NavigatorScreenParams<StockParamList> | undefined;
  Bills: NavigatorScreenParams<BillingParamList> | undefined;
  /** `report` opens a particular report — the dashboard's tiles pass it. */
  Reports: { report?: string } | undefined;
  AuditTrail: undefined;
  UserManagement: undefined;
  RolePermissions: undefined;
  HospitalConfig: undefined;
  Profile: undefined;
  Scan: undefined;
};

type RootParamList = {
  Login: undefined;
  App: NavigatorScreenParams<AppParamList>;
};

const linking: LinkingOptions<RootParamList> = {
  prefixes: [],
  config: {
    screens: {
      Login: "login",
      App: {
        screens: {
          Dashboard: "dashboard",
          Patients: "patients",
          RegisterPatient: "patients/new",
          Appointments: {
            path: "appointments",
            // A date in the link (?date=YYYY-MM-DD) opens the list on that day.
            screens: {
              AppointmentsList: "",
              BookAppointment: "book",
              RescheduleAppointment: "move/:id",
            },
          },
          OpdQueue: "opd/queue",
          Emergency: {
            path: "emergency",
            screens: {
              EmergencyBoard: "",
              RegisterArrival: "arrival",
              EmergencyVisit: "visits/:visitId",
              MedicalRecord: "patients/:patientId/record",
            },
          },
          MyAppointments: "doctor/appointments",
          MyPatients: {
            path: "doctor",
            screens: {
              WardBoard: "patients",
              Bedside: "patients/:admissionId",
              Discharge: "patients/:admissionId/discharge",
            },
          },
          Consultation: "opd/consultation/:patientId",
          MedicalRecord: "patients/:patientId/record",
          AdmittedPatients: {
            path: "ipd",
            screens: {
              WardBoard: "patients",
              Bedside: "patients/:admissionId",
              AdmitPatient: "admit",
              Discharge: "patients/:admissionId/discharge",
            },
          },
          Beds: "beds",
          Icu: {
            path: "icu",
            screens: {
              WardBoard: "",
              Bedside: "patients/:admissionId",
            },
          },
          NursingPatients: {
            path: "nursing",
            screens: {
              WardBoard: "patients",
              Bedside: "patients/:admissionId",
            },
          },
          Handover: {
            path: "nursing/handover",
            screens: {
              HandoverList: "",
              Bedside: "patients/:admissionId",
            },
          },
          LabQueue: {
            path: "lab/requests",
            screens: { LabQueueList: "", LabOrder: ":orderId" },
          },
          LabReports: {
            path: "lab/reports",
            screens: { LabResultsList: "", LabOrder: ":orderId" },
          },
          PharmacyQueue: {
            path: "pharmacy",
            screens: {
              PharmacyQueueList: "prescriptions",
              Dispense: "dispense/:prescriptionId",
            },
          },
          MedicineStock: {
            path: "pharmacy/stock",
            screens: {
              InventoryList: "",
              InventoryItem: "items/:itemId",
              ReceiveStock: "receive",
              LowStock: "low-stock",
              StockLedger: "movements",
            },
          },
          Formulary: "pharmacy/formulary",
          Inventory: {
            path: "inventory",
            screens: {
              InventoryList: "",
              InventoryItem: "items/:itemId",
              ReceiveStock: "receive",
              IssueStock: "issue",
              LowStock: "low-stock",
              StockLedger: "movements",
            },
          },
          Bills: {
            path: "billing",
            screens: {
              BillsList: "bills",
              GenerateBill: "generate/:patientId?",
              BillDetail: "bills/:billId",
              RecordPayment: "payment/:billId",
              Receipt: "receipt/:paymentId",
              RefundSlip: "refund/:refundId",
              Outstanding: "outstanding",
            },
          },
          Reports: "reports",
          AuditTrail: "admin/audit",
          UserManagement: "admin/users",
          RolePermissions: "admin/roles",
          HospitalConfig: "admin/config",
          Profile: "profile",
          Scan: "scan",
        },
      },
    },
  },
};

/** Longest the splash may stay up; past this the app renders with system fonts. */
const SPLASH_TIMEOUT_MS = 8000;

/**
 * Last-resort screen for a render crash. Without it a release build shows only the
 * blank splash background, which says nothing about what went wrong.
 */
class StartupErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch() {
    void SplashScreen.hideAsync();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        contentContainerStyle={{ padding: 24, paddingTop: 64 }}
      >
        <Text style={{ fontSize: 20, fontWeight: "600", color: "#b42318" }}>
          Metro Hospital could not start
        </Text>
        <Text style={{ marginTop: 12, fontSize: 14, color: "#101828" }}>
          {String(error.message || error)}
        </Text>
        <Text style={{ marginTop: 12, fontSize: 11, color: "#475467" }}>
          {error.stack?.split("\n").slice(0, 12).join("\n")}
        </Text>
      </ScrollView>
    );
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [splashTimedOut, setSplashTimedOut] = useState(false);
  // A font that fails to load must not hold the app on the splash; it falls back to the system font.
  const ready = fontsLoaded || Boolean(fontError) || splashTimedOut;

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimedOut(true), SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // started before sign-in so the login screen can already report being offline.
  useEffect(() => startNetworkWatch(), []);
  useEffect(() => registerServiceWorker(), []);

  if (!ready) return null;

  return (
    <StartupErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer
              linking={linking}
              theme={{
                dark: false,
                colors: {
                  primary: palette.clinical[600],
                  background: palette.surface.secondary,
                  card: palette.surface.primary,
                  text: palette.text.primary,
                  border: palette.border.default,
                  notification: palette.danger.text,
                },
                fonts: {
                  regular: {
                    fontFamily: "Inter_400Regular",
                    fontWeight: "400",
                  },
                  medium: { fontFamily: "Inter_500Medium", fontWeight: "500" },
                  bold: { fontFamily: "Inter_600SemiBold", fontWeight: "600" },
                  heavy: { fontFamily: "Inter_600SemiBold", fontWeight: "600" },
                },
              }}
            >
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StartupErrorBoundary>
  );
}
