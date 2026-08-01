import { useState } from "react";
import { verifyAdminPassword, uploadPdf } from "../lib/api";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);
    try {
      await verifyAdminPassword(password);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadError(null);
    setUploadResult(null);
    setIsUploading(true);
    try {
      const result = await uploadPdf(file, password);
      setUploadResult(result);
      setFile(null);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center px-gutter">
        <form onSubmit={handleLogin} className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-8 w-full max-w-sm shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
            <h2 className="text-headline-md font-bold">Admin Access</h2>
          </div>
          <label className="text-label-md text-on-surface-variant block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border-subtle rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Enter admin password"
            autoFocus
          />
          {authError && <p className="text-error text-label-md mb-4">{authError}</p>}
          <button
            type="submit"
            disabled={isVerifying || !password}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isVerifying ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 md:left-sidebar-width right-0 z-40 h-16 px-gutter flex justify-between items-center bg-surface/80 backdrop-blur-md">
        <h2 className="text-headline-md font-bold text-primary">Admin — Upload Documents</h2>
      </header>

      <section className="flex-1 overflow-y-auto chat-scroll pt-24 pb-12 px-gutter">
        <div className="max-w-[600px] mx-auto w-full">
          <form onSubmit={handleUpload} className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-8 shadow-sm">
            <label className="text-label-md text-on-surface-variant block mb-2">Select a PDF file</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="w-full border border-border-subtle rounded-xl px-4 py-3 mb-4"
            />
            <button
              type="submit"
              disabled={!file || isUploading}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">upload_file</span>
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
            {uploadError && <p className="text-error text-label-md mt-4">{uploadError}</p>}
            {uploadResult && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-label-md text-primary font-medium">
                  ✓ Uploaded "{uploadResult.filename}" — {uploadResult.chunks_added} chunks indexed.
                </p>
              </div>
            )}
          </form>
        </div>
      </section>
    </>
  );
}