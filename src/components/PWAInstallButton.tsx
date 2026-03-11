"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => {
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(media.matches || iosStandalone);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    checkInstalled();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", checkInstalled);
    } else {
      media.addListener(checkInstalled);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", checkInstalled);
      } else {
        media.removeListener(checkInstalled);
      }
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt || isInstalling) return;
    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[100] sm:bottom-6">
      <Button
        type="button"
        onClick={handleInstall}
        disabled={isInstalling}
        className="rounded-full px-4 py-2 shadow-lg"
      >
        <Download className="h-4 w-4" />
        {isInstalling ? "Installing..." : "Install App"}
      </Button>
    </div>
  );
}
