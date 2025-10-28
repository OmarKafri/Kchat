"use server";

import {
  UserInfromation,
  RegisterationEntred,
  LoginInfoEntred,
  UserWithoutId,
} from "@/types/user";

export async function Registeration(info: RegisterationEntred): Promise<{
  success: boolean;
  error?: string;
  data?: UserInfromation;
}> {
  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: info.email,
        username: info.username,
        password: info.password,
      }),
    });
    const result = await response.json();

    if (response.ok) {
      return { success: true, data: result.user };
    } else {
      return { success: false, error: result.message || "Registration failed" };
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, error: "An error occurred while registering" };
  }
}

export async function Loging(
  info: LoginInfoEntred
): Promise<{ success: boolean; error?: string; data?: UserInfromation }> {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: info.email,
        password: info.password,
      }),
    });
    const result = await response.json();

    if (response.ok) {
      return { success: true, data: result.user };
    } else {
      return { success: false, error: result.message || "Login failed" };
    }
  } catch (error) {
    console.error("Error during Loging in:", error);
    return { success: false, error: "An error occurred while Loging in" };
  }
}

export async function getAllContacts(): Promise<{
  success: boolean;
  error?: string;
  data?: UserInfromation[];
}> {
  try {
    const response = await fetch("http://localhost:3000/api/contacts", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    if (response.ok) return { success: true, data: result.Users };
    else return { success: false, error: result.message || "No contacts" };
  } catch (error) {
    console.error("Error during Loging in:", error);
    return { success: false, error: "Cant Get Contacts" };
  }
}

export async function getContacts(id: string): Promise<{
  success: boolean;
  error?: string;
  data?: UserInfromation[];
}> {
  try {
    const response = await fetch("http://localhost:3000/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
      }),
    });
    const result = await response.json();

    if (response.ok) return { success: true, data: result.Users };
    else return { success: false, error: result.message || "No contacts" };
  } catch (error) {
    console.error("Error during Loging in:", error);
    return { success: false, error: "Cant Get Contacts" };
  }
}

export async function getOneContcat(id: string): Promise<{
  success: boolean;
  error?: string;
  data?: UserWithoutId;
}> {
  try {
    const response = await fetch("http://localhost:3000/api/contacts/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: id,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message };
    }
    return { success: true, data: result.contact };
  } catch (error) {
    console.error("Error Getting The Contcat:", error);
    return { success: false, error: "Cant Get Contact" };
  }
}
