import { useRef } from "react";
import { Camera, Trash, Check, Mail } from "lucide-react";
import { formFieldClass } from "@/lib/formClasses.js";
import { getUserInitials } from "@/lib/userInitials.js";

export default function ProfileSettings({
  auth,
  variant = "page",

  preview,
  setPreview,

  displayName,
  setDisplayName,

  uploading,
  saveProfile,

  removePhoto,
}) {
  const fileRef = useRef(null);

  const openFilePicker = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">

      {/* Avatar */}

      <div className="flex flex-col items-center gap-4">

        <div className="relative">

          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">

            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-slate-600 dark:text-slate-300">
                {getUserInitials(auth.user?.name || auth.user?.email)}
              </span>
            )}

          </div>

        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap justify-center gap-3">

          <button
            type="button"
            onClick={openFilePicker}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Camera size={18} />
            Upload
          </button>

          <button
            type="button"
            onClick={removePhoto}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          >
            <Trash size={18} />
            Remove
          </button>

        </div>

        <p className="text-xs text-slate-500 text-center">
          JPG, PNG or WEBP recommended
        </p>

      </div>

      {/* Form */}

      <div className="space-y-5 rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">

        <div>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Display name
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(e) =>
              setDisplayName(e.target.value)
            }
            placeholder="Your name"
            className={`${formFieldClass} mt-1.5`}
          />

        </div>

        <div>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>

          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-slate-200/90 bg-slate-100/90 px-3 py-2.5 dark:border-slate-600/80 dark:bg-slate-950/70">

            <Mail
              size={18}
              className="text-slate-500"
            />

            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
              {auth.user?.email || "Not Available"}
            </span>

          </div>

        </div>

      </div>

      {/* Buttons */}

      <div className="flex gap-3 flex-wrap">

        <button
          type="button"
          onClick={saveProfile}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-500"
        >
          <Check size={18} />

          {uploading
            ? "Saving..."
            : "Save Changes"}

        </button>

        {variant === "modal" && (
          <button
            type="button"
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-3"
          >
            Cancel
          </button>
        )}

      </div>

    </div>
  );
}