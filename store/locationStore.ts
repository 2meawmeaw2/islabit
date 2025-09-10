import { create } from "zustand";
import * as Location from "expo-location";

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: Coordinates | null;
  permissionStatus: Location.PermissionStatus | null;
  isFetching: boolean;
  error: string | null;
  lastUpdated: number | null;
  ensureCoords: () => Promise<Coordinates | null>;
  refreshCoords: () => Promise<Coordinates | null>;
  requestPermissionAndFetch: () => Promise<Coordinates | null>;
  setCoords: (lat: number, lng: number) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  permissionStatus: null,
  isFetching: false,
  error: null,
  lastUpdated: null,

  setCoords: (lat: number, lng: number) => {
    set({ coords: { lat, lng }, lastUpdated: Date.now(), error: null });
  },

  ensureCoords: async () => {
    const { coords } = get();
    if (coords) return coords;
    return get().requestPermissionAndFetch();
  },

  refreshCoords: async () => {
    return get().requestPermissionAndFetch();
  },

  requestPermissionAndFetch: async () => {
    try {
      set({ isFetching: true, error: null });

      // Check existing permissions first
      const existing = await Location.getForegroundPermissionsAsync();
      let status = existing.status;

      if (status !== Location.PermissionStatus.GRANTED) {
        const asked = await Location.requestForegroundPermissionsAsync();
        status = asked.status;
      }

      set({ permissionStatus: status });

      if (status !== Location.PermissionStatus.GRANTED) {
        set({ isFetching: false, error: "Location permission not granted" });
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: false,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      set({
        coords: { lat, lng },
        isFetching: false,
        lastUpdated: Date.now(),
        error: null,
      });

      return { lat, lng };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to get location";
      set({ isFetching: false, error: message });
      return null;
    }
  },
}));
