import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, touchTargets, typography } from "@/tokens";

export type TabKey = "BERANDA" | "SETOR" | "AKTIVITAS" | "POIN" | "PROFIL";

interface BottomTabNavigatorProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  draftCount?: number;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "BERANDA", label: "Beranda", icon: "⌂" },
  { key: "SETOR", label: "Setor", icon: "⊕" },
  { key: "AKTIVITAS", label: "Aktivitas", icon: "≡" },
  { key: "POIN", label: "Poin", icon: "★" },
  { key: "PROFIL", label: "Profil", icon: "☺" },
];

export function BottomTabNavigator({
  currentTab,
  onSelectTab,
  draftCount = 0,
}: BottomTabNavigatorProps) {
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.key;
        const isSetor = tab.key === "SETOR";
        const hasBadge = tab.key === "AKTIVITAS" && draftCount > 0;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isSetor && styles.tabButtonSetor]}
            onPress={() => onSelectTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Navigasi ke tab ${tab.label}`}
          >
            {/* Setor special center action highlight */}
            {isSetor ? (
              <View style={[styles.setorCircle, isActive && styles.setorCircleActive]}>
                <Text style={styles.setorIcon}>{tab.icon}</Text>
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <Text
                  style={[
                    styles.tabIcon,
                    isActive ? styles.tabIconActive : styles.tabIconInactive,
                  ]}
                >
                  {tab.icon}
                </Text>
                {hasBadge && (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeDotText}>{draftCount}</Text>
                  </View>
                )}
              </View>
            )}

            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                isSetor && styles.tabLabelSetor,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    justifyContent: "space-around",
    alignItems: "center",
    minHeight: touchTargets.minButtonHeight + 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
    paddingVertical: spacing.xs,
  },
  tabButtonSetor: {
    marginTop: -12,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  tabIcon: {
    fontSize: 20,
    fontWeight: "700",
  },
  tabIconActive: {
    color: colors.brand900,
  },
  tabIconInactive: {
    color: colors.textMuted,
  },
  setorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  setorCircleActive: {
    backgroundColor: colors.brand700,
  },
  setorIcon: {
    fontSize: 22,
    color: colors.textInverse,
    fontWeight: "800",
  },
  badgeDot: {
    position: "absolute",
    top: -2,
    right: -8,
    backgroundColor: colors.warningText,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeDotText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: "700",
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.brand900,
    fontWeight: "700",
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },
  tabLabelSetor: {
    marginTop: 2,
    color: colors.brand900,
  },
});
