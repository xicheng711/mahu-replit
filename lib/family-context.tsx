import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  FamilyMembership,
  getAllMemberships,
  getActiveFamilyId,
  setActiveFamilyId,
  getFamilyRoom,
  saveFamilyRoom,
  getCurrentMember,
  setCurrentMember,
  migrateToMultiFamily,
} from './storage';

export interface FamilyContextValue {
  memberships: FamilyMembership[];
  activeMembership: FamilyMembership | null;
  isCreator: boolean;
  hasFamilies: boolean;
  switchFamily: (familyId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextValue>({
  memberships: [],
  activeMembership: null,
  isCreator: false,
  hasFamilies: false,
  switchFamily: async () => {},
  refresh: async () => {},
});

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [memberships, setMemberships] = useState<FamilyMembership[]>([]);
  const [activeMembership, setActiveMembership] = useState<FamilyMembership | null>(null);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    await migrateToMultiFamily();
    const all = await getAllMemberships();
    const activeId = await getActiveFamilyId();
    const active = all.find(m => m.familyId === activeId) ?? all[0] ?? null;
    setMemberships(all);
    setActiveMembership(active);
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      refresh();
    }
  }, [refresh]);

  const switchFamily = useCallback(async (familyId: string) => {
    const all = await getAllMemberships();
    const target = all.find(m => m.familyId === familyId);
    if (!target) return;
    // Save the active family ID
    await setActiveFamilyId(familyId);
    // Update the main family_room_v1 key to point to this family's room
    await saveFamilyRoom(target.room);
    // Update current member to my member in that room
    const myMember = target.room.members.find(m => m.id === target.myMemberId);
    if (myMember) await setCurrentMember(myMember);
    setActiveMembership(target);
  }, []);

  const isCreator = activeMembership?.role === 'creator';
  const hasFamilies = memberships.length > 0;

  return (
    <FamilyContext.Provider value={{ memberships, activeMembership, isCreator, hasFamilies, switchFamily, refresh }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext() {
  return useContext(FamilyContext);
}
