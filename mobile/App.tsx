import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { colors, spacing, touchTargets, typography } from "@/tokens";
import { MobileAuthProvider } from "@/context/auth-context";
import { mobileApiClient } from "@/lib/api-client";
import { OfflineDraftManager } from "@/lib/offline-draft";
import { BottomTabNavigator, TabKey } from "@/navigation/BottomTabNavigator";
import { HomeScreen } from "@/screens/HomeScreen";
import { NewDepositScreen } from "@/screens/NewDepositScreen";
import { ActivityScreen } from "@/screens/ActivityScreen";
import { TrackingDetailScreen } from "@/screens/TrackingDetailScreen";
import { PointsScreen } from "@/screens/PointsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

function MainContent() {
  const [currentTab, setCurrentTab] = useState<TabKey>("BERANDA");
  const [selectedPickupId, setSelectedPickupId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [draftCount, setDraftCount] = useState<number>(0);

  const refreshDraftCount = async () => {
    const drafts = await OfflineDraftManager.getDrafts();
    setDraftCount(drafts.length);
  };

  useEffect(() => {
    refreshDraftCount();
  }, [currentTab]);

  const toggleNetworkSimulation = () => {
    const nextStatus = !isOffline;
    setIsOffline(nextStatus);
    mobileApiClient.setOnlineStatus(!nextStatus);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Offline Status / Demo Bar */}
      {isOffline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Mode Luring Aktif — Permohonan disimpan lokal di perangkat
          </Text>
          <TouchableOpacity
            style={styles.offlineToggleBtn}
            onPress={toggleNetworkSimulation}
            accessibilityLabel="Ubah ke mode daring"
          >
            <Text style={styles.offlineToggleText}>Pulihkan Online</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.networkDemoBar}>
          <Text style={styles.networkOnlineText}>● Terhubung ke TPS3R Sukawati</Text>
          <TouchableOpacity
            style={styles.simulateOfflineBtn}
            onPress={toggleNetworkSimulation}
            accessibilityLabel="Simulasikan mode luring"
          >
            <Text style={styles.simulateOfflineText}>Uji Offline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Routing */}
      <View style={styles.body}>
        {selectedPickupId ? (
          <TrackingDetailScreen
            pickupId={selectedPickupId}
            onBack={() => setSelectedPickupId(null)}
          />
        ) : (
          <>
            {currentTab === "BERANDA" && (
              <HomeScreen
                onNavigateToSetor={() => setCurrentTab("SETOR")}
                onNavigateToActivity={() => setCurrentTab("AKTIVITAS")}
                onNavigateToPoints={() => setCurrentTab("POIN")}
              />
            )}

            {currentTab === "SETOR" && (
              <NewDepositScreen
                onSuccess={(pickupId) => {
                  refreshDraftCount();
                  if (pickupId === "draft_local") {
                    setCurrentTab("AKTIVITAS");
                  } else {
                    setSelectedPickupId(pickupId);
                  }
                }}
                onCancel={() => setCurrentTab("BERANDA")}
              />
            )}

            {currentTab === "AKTIVITAS" && (
              <ActivityScreen
                onSelectPickup={(id) => setSelectedPickupId(id)}
                onNavigateToSetor={() => setCurrentTab("SETOR")}
              />
            )}

            {currentTab === "POIN" && (
              <PointsScreen
                onNavigateToSetor={() => setCurrentTab("SETOR")}
              />
            )}

            {currentTab === "PROFIL" && <ProfileScreen />}
          </>
        )}
      </View>

      {/* Bottom Tabs (hidden only during deep tracking) */}
      {!selectedPickupId && (
        <BottomTabNavigator
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setSelectedPickupId(null);
            setCurrentTab(tab);
          }}
          draftCount={draftCount}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <MobileAuthProvider>
      <MainContent />
    </MobileAuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  offlineBanner: {
    backgroundColor: colors.warningText,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offlineBannerText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 11,
    flex: 1,
  },
  offlineToggleBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.sm,
    minHeight: 28,
    justifyContent: "center",
  },
  offlineToggleText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 11,
  },
  networkDemoBar: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  networkOnlineText: {
    ...typography.caption,
    color: colors.successText,
    fontWeight: "700",
    fontSize: 11,
  },
  simulateOfflineBtn: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  simulateOfflineText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
});
