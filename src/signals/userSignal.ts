import { signal } from "@preact/signals-react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

type UserType = FirebaseAuthTypes.User | null;

const getUserSignal = signal<UserType>(null);

auth().onAuthStateChanged((newUser: UserType) => {
  getUserSignal.value = newUser;
});

export { getUserSignal, UserType };
