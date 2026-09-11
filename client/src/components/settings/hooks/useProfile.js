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

  const remember = !!localStorage.getItem('token');

  const saveProfile = useCallback(async () => {
    const name = displayName.trim();

    setUploading(true);

    try {
      if (auth?.token) {
        const res = await apiRequest("/api/user/profile", {
          method: "PUT",
          body: {
            name,
            avatarBase64: preview,
          },
          token: auth.token,
        });

        const updatedUser = res?.user || {
          ...auth.user,
          name: name || auth.user.name,
          avatarUrl: preview,
        };

        auth.setUser(updatedUser, remember);
        if (res?.token) {
          auth.setToken(res.token, remember);
        }
      } else {
        auth.setUser({
          ...auth.user,
          name: name || auth.user.name,
          avatarUrl: preview,
        }, remember);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [displayName, preview, auth, remember]);

  const removePhoto = useCallback(async () => {
    const originalUser = auth.user;
    const originalPreview = preview;

    setPreview('');
    auth.setUser({ ...auth.user, avatarUrl: '' }, remember);

    if (auth?.token) {
      try {
        const res = await apiRequest('/api/user/profile', {
          method: 'PUT',
          body: { avatarBase64: '' },
          token: auth.token,
        });
        if (res?.user) auth.setUser(res.user, remember);
        if (res?.token) auth.setToken(res.token, remember);
      } catch (err) {
        console.error('Failed to remove photo', err);
        auth.setUser(originalUser, remember);
        setPreview(originalPreview);
      }
    }
  }, [auth, preview, remember]);

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
