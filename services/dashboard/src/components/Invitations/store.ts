import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Email {
  id: string;
  text: string;
  isValid: boolean;
}

function getEmptyEmail(): Email {
  return { id: uuidv4(), text: "", isValid: false };
}

const INITIAL_EMAILS: Email[] = [
  getEmptyEmail(),
  getEmptyEmail(),
  getEmptyEmail(),
];

interface EmailStore {
  emails: Email[];
  invalidEmails: Email[];
  isAllEmailsEmpty: boolean;
  addEmail: () => void;
  deleteEmail: (id: string) => void;
  updateEmail: (id: string, text: string, isValid: boolean) => void;
  resetEmails: () => void;
  getValidEmails: () => Email[];
}

export const useEmailStore = create<EmailStore>((set, get) => {
  const computeDerived = (emails: Email[]) => ({
    invalidEmails: emails.filter(
      (email) => !email.isValid && email.text.trim() !== "",
    ),
    isAllEmailsEmpty: emails.every((email) => email.text.trim() === ""),
  });

  const initialDerived = computeDerived(INITIAL_EMAILS);

  return {
    emails: INITIAL_EMAILS,
    invalidEmails: initialDerived.invalidEmails,
    isAllEmailsEmpty: initialDerived.isAllEmailsEmpty,
    addEmail: () =>
      set((state) => {
        const newEmails = [...state.emails, getEmptyEmail()];
        return {
          emails: newEmails,
          ...computeDerived(newEmails),
        };
      }),
    deleteEmail: (id: string) =>
      set((state) => {
        let newEmails: Email[];
        if (state.emails.length === 1) {
          newEmails = [getEmptyEmail()];
        } else {
          newEmails = state.emails.filter((email) => email.id !== id);
        }
        return {
          emails: newEmails,
          ...computeDerived(newEmails),
        };
      }),
    updateEmail: (id: string, text: string, isValid: boolean) =>
      set((state) => {
        const newEmails = state.emails.map((email) =>
          email.id === id ? { ...email, text, isValid } : email,
        );
        return {
          emails: newEmails,
          ...computeDerived(newEmails),
        };
      }),
    resetEmails: () => {
      const emails = INITIAL_EMAILS;
      set({
        emails,
        ...computeDerived(emails),
      });
    },
    getValidEmails: () => {
      const state = get();
      return state.emails.filter(
        (email) => email.isValid && email.text.trim() !== "",
      );
    },
  };
});
