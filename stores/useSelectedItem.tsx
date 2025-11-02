import { create } from "zustand";

type SelectedItemState = {
  selectedId: number | null;
};

type SelectedItemActions = {
  store: (id: number) => void;
  clear: () => void;
};

export const useSelectedItem = create<SelectedItemState & SelectedItemActions>(
  (set) => ({
    selectedId: null,

    store: (id) => set({ selectedId: id }),
    clear: () => set({ selectedId: null }),
  })
);
