import { useEffect, useState } from "react";
import { AlertCircle, X, Smartphone } from "lucide-react";

const REMINDER_STORAGE_KEY = "mobile-install-reminder-dismissed";
const INSTALL_ATTEMPT_KEY = "apk-download-attempted";

/**
 * Shows a persistent reminder on DESKTOP users to install APK on their MOBILE device
 * Only shows if:
 * - User is on desktop (not mobile)
 * - APK download was attempted on mobile
 * - User hasn't dismissed the reminder recently
 */
export default function MobileInstallationReminder() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on desktop, not on mobile
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLowerCase(),
      );

    if (isMobile) return; // Don't show on mobile devices

    try {
      // Check if reminder was already dismissed
      const dismissedData = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (dismissedData) {
        const dismissedTime = JSON.parse(dismissedData).timestamp;
        const hoursSinceDismissed =
          (Date.now() - new Date(dismissedTime).getTime()) / (1000 * 60 * 60);

        // Show again after 24 hours
        if (hoursSinceDismissed < 24) {
          setDismissed(true);
          return;
        }
      }

      // Check if APK download was attempted
      const installAttempt = localStorage.getItem(INSTALL_ATTEMPT_KEY);
      if (installAttempt) {
        try {
          const data = JSON.parse(installAttempt);
          const hoursSinceAttempt =
            (Date.now() - new Date(data.timestamp).getTime()) /
            (1000 * 60 * 60);

          // Show reminder if download was attempted less than 7 days ago
          if (hoursSinceAttempt < 168) {
            setVisible(true);
          }
        } catch {}
      }
    } catch (e) {
      console.warn("Error checking install reminder:", e);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(
        REMINDER_STORAGE_KEY,
        JSON.stringify({ timestamp: new Date().toISOString() }),
      );
    } catch {}
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed top-24 right-4 z-[50] max-w-sm">
      <div className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Smartphone className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Install on Your Phone
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Complete the APK installation on your mobile device to use the
                  Ashish Properties app.
                </p>
                <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                  <strong>Steps:</strong>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Open Downloads on your phone</li>
                    <li>Tap AashishProperty.apk</li>
                    <li>Allow unknown app installation if prompted</li>
                    <li>Tap Install and Launch</li>
                  </ol>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
