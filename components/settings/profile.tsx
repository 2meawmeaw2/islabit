// ProfileHeader.tsx
import React, { memo } from "react";
import {
  I18nManager,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

export interface ProfileHeaderProps {
  /** Main display name */
  name: string;
  /** Optional first line under the name (e.g., role/description) */
  headline?: string;
  /** Optional second line under the name */
  /** Avatar image (require(...) or { uri }) */
  avatar: ImageSourcePropType;
  /** Show the small edit button on the opposite side of the avatar */
  showEdit?: boolean;
  /** Called when the edit button is pressed */
  onEdit?: () => void;
  /** Force RTL/LTR. Defaults to device direction. */
  rtl?: boolean;
  /** Avatar diameter in pixels */
  avatarSize?: number;
  /** Card background */
  /** Name color */
  nameColor?: string;
  /** Secondary text color */
  /** Extra styles for the outer card */
  containerStyle?: StyleProp<ViewStyle>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  headline,
  avatar,
  onEdit,
  showEdit = true,
  rtl = I18nManager.isRTL,
  avatarSize = 76,
  nameColor = "#111111",
  containerStyle,
}) => {
  const flexDir = rtl ? styles.rowReverse : styles.row;

  return (
    <View
      className=" py-6 px-5 mx-3 rounded-2xl border-border-primary  border-[1px] bg-fore  "
      style={[flexDir, containerStyle]}
    >
      <Image
        source={avatar}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        }}
        className="border-border-secondary border-[1px]"
      />

      <View style={styles.textWrap} pointerEvents="none">
        <Text
          className="font-ibm-plex-arabic-bold text-xl w-full"
          style={[styles.name, { color: nameColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>

        {Boolean(headline) && (
          <Text
            style={[styles.sub]}
            numberOfLines={2}
            className="font-ibm-plex-arabic-light text-text-secondary/80 text-sm"
          >
            {headline}
          </Text>
        )}
      </View>
      {showEdit ? (
        <Pressable
          onPress={onEdit}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          className="  justify-center"
          testID="edit-button"
        >
          <View style={styles.editCircle}>
            {/* Using a unicode pencil to avoid external icon deps */}
            <Text
              className="font-ibm-plex-arabic-light text-text-primary "
              style={styles.editGlyph}
            >
              ✎
            </Text>
          </View>
        </Pressable>
      ) : (
        // Spacer to keep the title centered when edit is hidden
        <View className="h-20 w-20" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  rowReverse: { flexDirection: "row-reverse" },

  textWrap: {
    flex: 1,
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  name: {
    textAlign: "right",
    lineHeight: 24,
  },
  sub: {
    marginTop: 6,
    textAlign: "right",
    lineHeight: 20,
  },

  editCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
  },
  editGlyph: {},
});

export default memo(ProfileHeader);
