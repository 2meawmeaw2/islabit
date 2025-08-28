import { StyleSheet } from "react-native";

const S = StyleSheet.create({
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowEnd: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  subtleRight: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 88,
    alignItems: "center",
    borderWidth: 1,
  },
  pillActive: { backgroundColor: "#00AEEF", borderColor: "#00AEEF" },
  pillIdle: { backgroundColor: "#1A1E1F", borderColor: "#6C7684" },

  sectionHdr: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  boxRow: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rightText: { textAlign: "right", color: "#475569" },
  centerCol: { alignItems: "center", width: "18%" },
  dayCell: {
    width: "13%",
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
  },
  bold: { fontWeight: "700", color: "#0F172A", marginTop: 2 },
  weekHdr: {
    width: "13%",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
  },
  monthCell: {
    width: "13%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  smallBtn: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: "#0B1623", fontWeight: "700" },
});

export default S;
