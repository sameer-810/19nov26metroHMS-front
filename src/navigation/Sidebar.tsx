import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { webAria } from "@shared/ui/a11y";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut, ChevronsLeft, ChevronsRight } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { ROLE_LABELS } from "@shared/permissions";
import { radius, layout, chrome } from "@shared/designSystem";
import { Text, VStack, HStack, Avatar, BrandMark } from "@shared/ui";
import { NavItem, SECTION_ORDER, useSidebarNavItems } from "./navItems";

interface Props {
  activeRoute: string;
  onNavigate: (name: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeRoute,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const hospital = useAuthStore((s) => s.hospital);
  const logout = useAuthStore((s) => s.logout);
  const items = useSidebarNavItems();

  return (
    <View
      role="navigation"
      accessibilityLabel="Main navigation"
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 18,
          width: collapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth,
        },
      ]}
    >
      {/* the hospital name is shown because a user may hold accounts at more than one site. */}
      <HStack
        gap={10}
        align="center"
        style={{
          paddingHorizontal: collapsed ? 0 : 18,
          justifyContent: collapsed ? "center" : "flex-start",
          marginBottom: 18,
        }}
      >
        <View style={styles.markPlate}>
          <BrandMark size={32} />
        </View>
        {!collapsed ? (
          <>
            <VStack gap={1} flex={1}>
              <Text
                variant="h3"
                numberOfLines={1}
                style={{ color: chrome.text }}
              >
                Metro Hospital
              </Text>
              <Text
                variant="caption"
                numberOfLines={1}
                style={{ color: chrome.textMuted }}
              >
                {hospital?.name || "Hospital"}
              </Text>
            </VStack>
            {onToggleCollapse ? (
              <Pressable
                onPress={onToggleCollapse}
                hitSlop={8}
                style={styles.toggleBtn}
                accessibilityRole="button"
                accessibilityLabel="Collapse sidebar"
              >
                <ChevronsLeft
                  size={18}
                  color={chrome.icon}
                  strokeWidth={2}
                />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </HStack>

      {collapsed && onToggleCollapse ? (
        <Pressable
          onPress={onToggleCollapse}
          hitSlop={8}
          style={styles.expandBtn}
          accessibilityRole="button"
          accessibilityLabel="Expand sidebar"
        >
          <ChevronsRight
            size={18}
            color={chrome.icon}
            strokeWidth={2}
          />
        </Pressable>
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: collapsed ? 10 : 12 }}
        showsVerticalScrollIndicator={false}
      >
        {SECTION_ORDER.map((section) => {
          const group = items.filter((it) => it.section === section);
          if (group.length === 0) return null;
          return (
            <View key={section}>
              {collapsed ? (
                <View style={styles.sectionDivider} />
              ) : (
                <Text variant="overline" style={styles.sectionLabel}>
                  {section}
                </Text>
              )}
              {group.map((item) => (
                <NavRow
                  key={item.name}
                  item={item}
                  active={activeRoute === item.name}
                  collapsed={collapsed}
                  onPress={() => onNavigate(item.name)}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: collapsed ? 0 : 14,
            alignItems: collapsed ? "center" : "stretch",
          },
        ]}
      >
        {collapsed ? (
          <VStack gap={10} align="center">
            <Avatar name={user?.fullName || "U"} size={34} />
            <Pressable
              onPress={() => logout()}
              hitSlop={8}
              style={styles.logoutBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut size={17} color={chrome.icon} strokeWidth={1.9} />
            </Pressable>
          </VStack>
        ) : (
          <HStack gap={10} align="center">
            <Avatar name={user?.fullName || "U"} size={36} />
            <VStack gap={1} flex={1}>
              <Text
                variant="label"
                numberOfLines={1}
                style={{ color: chrome.text }}
              >
                {user?.fullName}
              </Text>
              <Text
                variant="caption"
                numberOfLines={1}
                style={{ color: chrome.textMuted }}
              >
                {user?.designation || (user ? ROLE_LABELS[user.role] : "")}
              </Text>
            </VStack>
            <Pressable
              onPress={() => logout()}
              hitSlop={8}
              style={styles.logoutBtn}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut size={17} color={chrome.icon} strokeWidth={1.9} />
            </Pressable>
          </HStack>
        )}
      </View>
    </View>
  );
}

function NavRow({
  item,
  active,
  collapsed,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onPress: () => void;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={item.label}
      // native reads "selected"; web uses aria-current instead (aria-selected is invalid on a link).
      accessibilityState={
        Platform.OS === "web" ? undefined : { selected: active }
      }
      {...webAria({ current: active ? "page" : undefined })}
      style={({ pressed }) => [
        styles.navRow,
        collapsed && styles.navRowCollapsed,
        active && styles.navRowActive,
        pressed && !active ? { backgroundColor: chrome.hover } : null,
      ]}
    >
      {active && !collapsed ? <View style={styles.activeBar} /> : null}
      <Icon
        size={18}
        color={active ? chrome.text : chrome.icon}
        strokeWidth={active ? 2.3 : 1.9}
      />
      {!collapsed ? (
        <Text
          variant="label-lg"
          numberOfLines={1}
          style={{
            color: active ? chrome.text : chrome.textMuted,
          }}
        >
          {item.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    height: "100%",
    backgroundColor: chrome.bg,
  },
  markPlate: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: chrome.plate,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  expandBtn: {
    alignSelf: "center",
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: chrome.hover,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: layout.navRowHeight,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginBottom: 1,
  },
  navRowCollapsed: { justifyContent: "center", paddingHorizontal: 0, gap: 0 },
  navRowActive: { backgroundColor: chrome.activeBg },
  /** Red marker on the current page, echoing the red half of the logo pulse. */
  activeBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: radius.full,
    backgroundColor: chrome.activeBar,
  },
  sectionLabel: {
    paddingHorizontal: 10,
    marginTop: 12,
    marginBottom: 3,
    color: chrome.textMuted,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: chrome.border,
    marginVertical: 6,
    marginHorizontal: 4,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: chrome.border,
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
