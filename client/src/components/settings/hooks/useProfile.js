import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../../../api/client";

export default function useProfile(auth) {
  const [preview, setPreview] = useState(auth?.user?.avatarUrl || "");
  const [displayName, setDisplayName] = useState(
    auth?.user?.name ||
    auth?.user?.email?.split("@")[0] ||
    ""
  );

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!auth?.user) return;

    setPreview(auth.user.avatarUrl || "");

    setDisplayName(
      auth.user.name ||
      auth.user.email?.split("@")[0] ||
      ""
    );
  }, [auth?.user]);

  const saveProfile = useCallback(async () => {
    const name = displayName.trim();

    setUploading(true);

    try {
      const updatedUser = {
        ...auth.user,
        name: name || auth.user.name,
        avatarUrl: preview,
      };

      auth.setUser(updatedUser);

      if (auth?.token) {
        await apiRequest("/api/user/profile", {
          method: "PUT",
          body: {
            name,
            avatarBase64: preview,
          },
          token: auth.token,
        });
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setUploading(false);
    }
  }, [displayName, preview, auth]);

  const removePhoto = useCallback(async () => {
    const originalUser = auth.user;
    const originalPreview = preview;

    setPreview('');
    auth.setUser({ ...auth.user, avatarUrl: '' });

    if (auth?.token) {
      try {
        await apiRequest('/api/user/profile', {
          method: 'PUT',
          body: { avatarBase64: '' },
          token: auth.token,
        });
      } catch (err) {
        console.error('Failed to remove photo', err);
        auth.setUser(originalUser);
        setPreview(originalPreview);
      }
    }
  }, [auth, preview]);

  return {
    preview,
    setPreview,
    displayName,
    setDisplayName,
    uploading,
    saveProfile,
    removePhoto,
  };
}