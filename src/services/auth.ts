import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import type { UserProfile } from "../types";

const STORAGE_KEY = "rakshak-ai-user";

export const signUp = async (
  profile: UserProfile,
  password: string
) => {

  const credential = await createUserWithEmailAndPassword(
    auth,
    profile.email,
    password
  );

  const uid = credential.user.uid;

  const userData = {
    uid,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  };

  await setDoc(doc(db, "users", uid), userData);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

  return userData;
};

export const signIn = async (
  email: string,
  password: string
) => {

  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = credential.user.uid;

  const snap = await getDoc(doc(db, "users", uid));

  const profile = snap.data() as UserProfile;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

  return profile;
};

export const logout = async () => {

  await signOut(auth);

  localStorage.removeItem(STORAGE_KEY);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const getStoredUser = (): UserProfile | null => {

  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : null;
};