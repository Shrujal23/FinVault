import { useRef } from "react";
import {
  Camera,
  Trash,
  Check,
  Mail,
} from "lucide-react";

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
    <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">

      {/* Avatar */}

      <div className="flex flex-col items-center gap-4">

        <div className="relative">

          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-cyan-500/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">

            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-slate-600 dark:text-slate-300">
                {(auth.user?.name ||
                  auth.user?.email ||
                  "U")[0].toUpperCase()}
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
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Camera size={18} />
            Upload
          </button>

          <button
            type="button"
            onClick={removePhoto}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 px-4 py-2 font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
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

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-5">

        <div>

          <label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Display Name
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(e) =>
              setDisplayName(e.target.value)
            }
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
          />

        </div>

        <div>

          <label className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Email Address
          </label>

          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">

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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50"
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