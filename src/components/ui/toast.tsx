import { toast as hotToast, ToastBar, Toaster as HotToaster } from 'react-hot-toast';
import { X } from 'lucide-react';

export const toast = {
  error: (message: string) => {
    return hotToast.error(message, {
      duration: Infinity,
      style: {
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '1rem',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)',
      },
    });
  },
  success: (message: string) => {
    return hotToast.success(message, {
      style: {
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#22c55e',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        padding: '1rem',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
      },
    });
  },
};

export function Toaster() {
  return (
    <HotToaster position="top-right">
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={`${
                t.type === 'error' ? 'text-red-500' : 'text-green-500'
              } flex items-center gap-2 min-h-[48px] p-4 relative`}
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: `1px solid ${
                  t.type === 'error'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(34, 197, 94, 0.3)'
                }`,
                boxShadow: `0 0 15px ${
                  t.type === 'error'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(34, 197, 94, 0.2)'
                }`,
              }}
            >
              <div className="flex-1 flex items-center gap-2">
                {icon}
                <p className="font-mono uppercase text-sm">{message}</p>
              </div>
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="p-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
}