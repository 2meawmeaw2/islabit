// SettingsItem.tsx
import React, { memo } from "react";
import {
  I18nManager,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { icons } from "@/assets/constants/icons";
type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Right-side icon: pass either a React element or an Image source */
  icon?: React.ReactNode;
  iconSource?: ImageSourcePropType;
  iconSize?: number;
  /** Show the left chevron (like in the screenshot) */
  showChevron?: boolean;
  /** Draw a thin divider on the bottom edge */
  showDivider?: boolean;
  /** Force RTL text alignment (defaults to device setting) */
  rtl?: boolean;
  /** Optional container style override */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

const SettingsItem = memo(
  ({
    label,
    onPress,
    disabled,
    icon,
    iconSource,
    iconSize = 20,
    showChevron = true,
    showDivider = true,
    rtl = I18nManager.isRTL,
    style,
    testID,
    accessibilityLabel,
  }: Props) => {
    const trailingIcon =
      icon ??
      (iconSource ? (
        <Image
          source={iconSource}
          resizeMode="contain"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : null);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        onPress={onPress}
        disabled={disabled}
        className={[
          // layout
          "min-h-14 px-4 w-full flex-row items-center",
          // theme
          "border-b border-text-brand/70",
        ].join(" ")}
      >
        {/* Left chevron (always on the left like the screenshot) */}
        {showChevron ? (
          <View className="w-7 items-start">
            <Text className="text-[22px] leading-[22px] text-text-primary">
              ‹
            </Text>
          </View>
        ) : (
          <View className="w-7" />
        )}

        {/* Title */}
        <Text
          numberOfLines={1}
          style={{ writingDirection: rtl ? "rtl" : "ltr" }}
          className={[
            "flex-1 text-base text-text-primary text-right ",
            // pick your desired weight; change if you want another
            "font-ibm-plex-arabic-bold  ",
          ].join(" ")}
        >
          {label}
        </Text>

        {/* Right-side icon */}
        <View className="w-7 items-end mr-1 ml-2 text-white">
          <Image
            source={icons.star}
            resizeMode="contain"
            className="size-6"
            style={{ tintColor: "#ffffff" }}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

export default SettingsItem;
