import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { palette } from "../designSystem";
import { Text } from "./Text";

const DEVELOPER_NAME = "FiveM Infotech";
const DEVELOPER_URL = "https://www.fiveminfotech.com/";

/** "Developed by" line shown at the end of a page; the name links to the developer's site. */
export function SiteFooter() {
  return (
    <View style={styles.root}>
      <Text variant="caption" tone="tertiary" style={styles.text}>
        Developed by{" "}
        <Text
          variant="caption"
          tone="link"
          style={styles.link}
          accessibilityRole="link"
          onPress={() => void Linking.openURL(DEVELOPER_URL)}
        >
          {DEVELOPER_NAME}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border.default,
    width: "100%",
  },
  text: { textAlign: "center" },
  link: { fontWeight: "600", textDecorationLine: "underline" },
});
