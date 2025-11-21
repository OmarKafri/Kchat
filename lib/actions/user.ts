"use server";

import {
  UserInfromation,
  RegisterationEntred,
  LoginInfoEntred,
  UserWithoutId,
} from "@/types/user";
import { getApiBaseUrl } from "@/lib/api-base";


export async function Registeration(info: RegisterationEntred): Promise<{
  success: boolean;
  error?: string;
  data?: UserInfromation;
}> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/register`, {
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
    const response = await fetch(`${getApiBaseUrl()}/api/login`, {
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
    const response = await fetch(`${getApiBaseUrl()}/api/contacts`, {
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
    const response = await fetch(`${getApiBaseUrl()}/api/contacts`, {
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
    const response = await fetch(`${getApiBaseUrl()}/api/contacts/contact`, {
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

export async function checkPassword(
  userid: string,
  inputPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/user?userID=${userid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: inputPassword,
        }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message };
    }
    return { success: true };
  } catch (error) {
    console.error("Error during Loging in:", error);
    return { success: false, error: "Currnet Password Is Wrong" };
  }
}

export async function updatePassword(
  userid: string,
  password: string
): Promise<{ success: boolean; error?: string; data?: UserWithoutId }> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/user?userID=${userid}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordHash: password,
        }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message };
    }
    return { success: true, data: result };
  } catch (error) {
    console.error("Error Getting The Contcat:", error);
    return { success: false, error: "Cant Update Password" };
  }
}



export async function updateImageOrUsername(
  imageUrl: string,
  username: string,
  userid: string
): Promise<{
  data?: { username?: string; image?: string };
  success: boolean;
  error?: string;
}> {
  try {
    const hasImage = imageUrl && imageUrl.trim().length > 0;
    const hasUsername = username && username.trim().length > 0;
    
    if (!hasImage && !hasUsername) {
      return { success: false, error: "There are no fields to change." };
    }

    let imageCloudUrl: string | undefined;

    if (hasImage) {
      const uploadResponse = await fetch(`${getApiBaseUrl()}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        return { success: false, error: errorData.message || "Failed to upload image" };
      }

      const uploadResult = await uploadResponse.json();
      imageCloudUrl = uploadResult.url;
    }

    const bodyToSend: Record<string, string> = {};
    if (hasUsername) bodyToSend.username = username.trim();
    if (imageCloudUrl) bodyToSend.image = imageCloudUrl;

    const response = await fetch(`${getApiBaseUrl()}/api/user?userID=${userid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyToSend),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "An error occurred while updating." };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, error: "Something went wrong while updating profile." };
  }
}

