import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type UserData = {
  prenom: string;
  nom: string;
  jour: number;
  mois: number;
  annee: number;
  genre: 'homme' | 'femme' | null;
  kua: number | null;
};

type UserContextType = {
  user: UserData;
  setUser: (u: Partial<UserData>) => void;
};

const defaultUser: UserData = {
  prenom: '',
  nom: '',
  jour: 1,
  mois: 1,
  annee: 1985,
  genre: null,
  kua: null,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData>(defaultUser);

  useEffect(() => {
    AsyncStorage.getItem('userProfile').then(v => {
      if (v) setUserState(JSON.parse(v));
    });
  }, []);

  const setUser = (data: Partial<UserData>) => {
    setUserState((prev) => {
      const updated = { ...prev, ...data };
      AsyncStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);