export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="absolute -top-14 left-0 right-0 flex justify-center animate-in fade-in duration-300">
      <div className="bg-error-container text-on-error-container px-4 py-2 rounded-lg flex items-center gap-2 shadow-md w-fit border border-error/20">
        <span className="material-symbols-outlined text-lg">error</span>
        <span className="text-label-md">{message}</span>
        <button onClick={onDismiss} className="ml-2 hover:underline font-bold">
          Dismiss
        </button>
      </div>
    </div>
  );
}