import { useState } from "react";
import { AutoHidingControlPanel } from "./components/ControlPanel/AutoHidingControlPanel";
import { VideoStage } from "./components/VideoStage/VideoStage";
import { DEFAULT_TEXT_ONLY_PROMPT } from "./constants/prompts";
import { useLucyRealtime } from "./hooks/useLucyRealtime";
import { useObjectUrl } from "./hooks/useObjectUrl";
import { useSessionTimer } from "./hooks/useSessionTimer";

export function App() {
  const lucy = useLucyRealtime();
  const timer = useSessionTimer(lucy.isRunning);
  const [prompt, setPrompt] = useState(DEFAULT_TEXT_ONLY_PROMPT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const imagePreviewUrl = useObjectUrl(imageFile);

  const handlePromptChange = (value: string) => {
    setFormError(null);
    setPrompt(value);
  };

  const handleImageChange = (file: File | null) => {
    setFormError(null);
    setImageFile(file);
  };

  const handleStart = () => {
    setFormError(null);
    void lucy.start({ prompt, image: imageFile, enhance: true });
  };

  const handleApply = () => {
    setFormError(null);
    void lucy.apply({ prompt, image: imageFile, enhance: true });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <VideoStage remoteStream={lucy.remoteStream} status={lucy.status} />
      <AutoHidingControlPanel
        prompt={prompt}
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        status={lucy.status}
        elapsedLabel={timer.elapsedLabel}
        error={formError ?? lucy.error}
        onPromptChange={handlePromptChange}
        onImageChange={handleImageChange}
        onImageError={setFormError}
        onStart={handleStart}
        onStop={lucy.stop}
        onApply={handleApply}
      />
    </main>
  );
}
