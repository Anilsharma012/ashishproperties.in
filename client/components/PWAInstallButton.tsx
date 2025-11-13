import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt?: () => Promise<void> | void;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// 🔥 Refresh pe hamesha banner dikhana (session-only dismiss)
const SESSION_KEY = "ashish_download_dismissed_session";

export default function PWAInstallButton() {
  const { toast } = useToast();
  const [bipEvt, setBipEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const isAndroid =
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

  // Show banner on every page load unless dismissed for session
  useEffect(() => {
    try {
      const hidden = sessionStorage.getItem(SESSION_KEY) === "1";
      if (!hidden) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  // Optional PWA install support
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault?.();
      setBipEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      try {
        localStorage.setItem("pwa-installed", "true");
      } catch {}
      setBipEvt(null);
      setVisible(false);
      setInstalling(false);
      toast({
        title: "Installed 🎉",
        description: "App has been added to your home screen.",
      });
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [toast]);

  const downloadApk = () => {
    if (!isAndroid) {
      try {
        // user requested an alert message if not on Android
        window.alert(
          "APK installs only on Android devices. Please open this site on an Android phone to install the APK.",
        );
      } catch {
        console.warn("Non-Android device attempted APK download");
      }
      return;
    }

    try {
      // Check if file exists before downloading
      fetch("/api/app/info")
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.data?.available) {
            toast({
              title: "Download not available",
              description: "APK file is not available. Please contact support.",
              variant: "destructive",
            });
            return;
          }

          // start download in same tab (server streams APK)
          window.location.href = "/api/app/download";

          // show inline instructions because silent install is not possible
          setShowInstallHelp(true);

          // Mark install attempt in localStorage
          try {
            localStorage.setItem(
              "apk-download-attempted",
              JSON.stringify({
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
              }),
            );
          } catch {}

          console.log("APK download started via UI");
        })
        .catch((e) => {
          console.error("Failed to check APK availability:", e);
          toast({
            title: "Connection error",
            description:
              "Could not check APK availability. Please check your internet and try again.",
            variant: "destructive",
          });
        });
    } catch (e) {
      console.error("Failed to start APK download:", e);
      toast({
        title: "Download failed",
        description: "Could not start APK download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const installPWA = async () => {
    if (!bipEvt?.prompt) {
      toast({
        title: "Install not available",
        description:
          "Your browser doesn't support direct install. Use the Download App button.",
      });
      return;
    }
    try {
      setInstalling(true);
      await bipEvt.prompt();
      const choice = await bipEvt.userChoice?.catch(() => null);
      if (choice?.outcome !== "accepted") setInstalling(false);
    } catch {
      setInstalling(false);
      toast({
        title: "Installation error",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBipEvt(null); // prompt usable once
    }
  };

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    // ✅ CENTERED container (safe gap above bottom nav)
    <div className="fixed inset-x-0 bottom-24 sm:bottom-20 z-[60] flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-[420px] pointer-events-auto rounded-2xl shadow-xl overflow-hidden">
        {/* Gradient header background */}
        <div className="bg-gradient-to-r from-[#C70000] to-[#A50000] text-white rounded-2xl">
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-bold">
                    Get the Ashish Properties App
                  </h3>
                  <p className="text-xs text-red-100">
                    {isAndroid
                      ? "Tap to download the Android app"
                      : "APK installs only on Android"}
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors ml-2 shrink-0"
                aria-label="Dismiss"
                disabled={installing}
                type="button"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* PRIMARY: Download APK */}
            <Button
              onClick={downloadApk}
              disabled={installing}
              size="sm"
              className="w-full bg-white text-[#C70000] hover:bg-gray-100 font-bold text-base py-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 mr-2" />
              Download App
            </Button>

            {/* SECONDARY: Optional PWA install if supported */}
            {bipEvt && (
              <button
                onClick={installPWA}
                disabled={installing}
                className="mt-3 w-full text-white/90 hover:text-white text-sm underline underline-offset-4"
              >
                Install without download
              </button>
            )}

            {/* Install helper modal shown after download starts */}
            {showInstallHelp && (
              <div className="mt-4 p-3 bg-white rounded-md text-sm text-gray-800">
                <div className="font-semibold mb-2 text-red-700">
                  📲 Installation Steps
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li>
                    <strong>Find the file:</strong> Open your phone's Downloads
                    app or Files app.
                  </li>
                  <li>
                    <strong>Locate APK:</strong> Look for "AashishProperty.apk"
                    file.
                  </li>
                  <li>
                    <strong>Allow installation:</strong> If you see a popup
                    asking to "Allow installation from unknown sources", tap OK.
                    <div className="text-gray-600 ml-4 mt-1">
                      If needed: Settings → Apps → Your Browser → Permissions →
                      Install unknown apps → Allow
                    </div>
                  </li>
                  <li>
                    <strong>Install:</strong> Tap the APK file and follow the
                    installation prompts.
                  </li>
                  <li>
                    <strong>Launch:</strong> Once done, find and open "Ashish
                    Properties" from your app drawer.
                  </li>
                </ol>

                <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong className="text-yellow-800">
                    ⚠️ If you see an error:
                  </strong>
                  <ul className="list-disc list-inside ml-1 mt-1 text-yellow-700">
                    <li>Try downloading again using the button below</li>
                    <li>Make sure you have at least 50MB free storage</li>
                    <li>Restart your phone and try again</li>
                  </ul>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href="/api/app/download"
                    className="flex-1 text-center px-3 py-2 bg-[#C70000] text-white rounded text-xs font-semibold"
                  >
                    Download again
                  </a>
                  <button
                    onClick={() => setShowInstallHelp(false)}
                    className="px-3 py-2 border border-gray-300 rounded text-xs"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
