import { useId, useMemo, useState } from "react";
import {
  buildLucyReferencePrompt,
  type LucyReferencePromptOptions,
} from "../../lib/lucyReferencePrompt";
import { Button } from "../StudioUI";
import { cx } from "../StudioUI/classNames";

type LucyPromptGeneratorProps = {
  onUsePrompt: (value: string) => void;
};

type LucyPromptGeneratorFormState = Omit<LucyReferencePromptOptions, "preserve"> & {
  preserve: string;
};

const initialFormState: LucyPromptGeneratorFormState = {
  baseInstruction: "",
  gender: "",
  age: "",
  bodyType: "",
  extraDetails: "",
  referenceDescription: "",
  hair: "",
  glasses: "",
  outfit: "",
  makeup: "",
  vibe: "",
  background: "",
  preserve: "",
};

export function LucyPromptGenerator({ onUsePrompt }: LucyPromptGeneratorProps) {
  const previewId = useId();
  const [formState, setFormState] =
    useState<LucyPromptGeneratorFormState>(initialFormState);
  const preserve = useMemo(
    () => parsePreserveDetails(formState.preserve),
    [formState.preserve],
  );
  const generatedPrompt = useMemo(
    () =>
      buildLucyReferencePrompt({
        ...formState,
        preserve,
      }),
    [formState, preserve],
  );
  const hasGeneratorInput = hasPromptGeneratorInput(formState);

  const updateField = <FieldName extends keyof LucyPromptGeneratorFormState>(
    fieldName: FieldName,
    value: LucyPromptGeneratorFormState[FieldName],
  ) => {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [fieldName]: value,
    }));
  };

  return (
    <details className="rounded-md border border-white/10 bg-white/[0.03]">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-neutral-100 marker:text-neutral-500">
        Prompt generator
      </summary>
      <div className="space-y-3 border-t border-white/10 px-3 pb-3 pt-3">
        <div className="space-y-2">
          <GeneratorTextarea
            label="Base instruction"
            placeholder="Substitute the character in the video with an adult..."
            value={formState.baseInstruction}
            onChange={(value) => updateField("baseInstruction", value)}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-neutral-200">Gender</span>
              <select
                className={fieldClassName}
                value={formState.gender}
                onChange={(event) =>
                  updateField(
                    "gender",
                    event.target.value as LucyPromptGeneratorFormState["gender"],
                  )
                }
              >
                <option value="">Not specified</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <GeneratorField
              helperText="Adult ages only."
              label="Age"
              placeholder="Adult, late 20s, 35, middle-aged"
              value={formState.age}
              onChange={(value) => updateField("age", value)}
            />
            <GeneratorField
              label="Body type"
              placeholder="Athletic, slender, broad-shouldered"
              value={formState.bodyType}
              onChange={(value) => updateField("bodyType", value)}
            />
            <GeneratorField
              label="Hair"
              placeholder="Short black bob with soft bangs"
              value={formState.hair}
              onChange={(value) => updateField("hair", value)}
            />
            <GeneratorField
              label="Glasses"
              placeholder="Thin round glasses"
              value={formState.glasses}
              onChange={(value) => updateField("glasses", value)}
            />
            <GeneratorField
              label="Outfit"
              placeholder="Tailored ivory suit"
              value={formState.outfit}
              onChange={(value) => updateField("outfit", value)}
            />
            <GeneratorField
              label="Makeup"
              placeholder="Natural matte makeup"
              value={formState.makeup}
              onChange={(value) => updateField("makeup", value)}
            />
            <GeneratorField
              label="Vibe"
              placeholder="Confident, realistic, cinematic"
              value={formState.vibe}
              onChange={(value) => updateField("vibe", value)}
            />
          </div>
          <GeneratorTextarea
            label="Reference description"
            placeholder="Visible skin tone, face shape, hair, clothing, and distinctive features"
            value={formState.referenceDescription}
            onChange={(value) => updateField("referenceDescription", value)}
          />
          <GeneratorTextarea
            label="Extra details"
            placeholder="Freckles, facial hair, expression, accessories"
            value={formState.extraDetails}
            onChange={(value) => updateField("extraDetails", value)}
          />
          <GeneratorField
            label="Background"
            placeholder="Neutral studio backdrop"
            value={formState.background}
            onChange={(value) => updateField("background", value)}
          />
          <GeneratorTextarea
            helperText="Separate details with commas or new lines."
            label="Preserve details"
            placeholder="Realistic facial detail, natural expression"
            value={formState.preserve}
            onChange={(value) => updateField("preserve", value)}
          />
        </div>

        <div
          aria-labelledby={previewId}
          className="rounded-md border border-white/10 bg-black/25 p-3"
          role="region"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p id={previewId} className="text-xs font-semibold text-neutral-100">
              Generated prompt
            </p>
            <Button
              className="min-h-9 px-3 py-1.5 text-xs"
              disabled={!hasGeneratorInput}
              onClick={() => onUsePrompt(generatedPrompt)}
            >
              Use generated prompt
            </Button>
          </div>
          <p className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap break-words text-xs leading-5 text-neutral-300">
            {hasGeneratorInput
              ? generatedPrompt
              : "Add character details to preview a Lucy prompt."}
          </p>
        </div>
      </div>
    </details>
  );
}

type GeneratorFieldProps = {
  helperText?: string;
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string) => void;
};

function GeneratorField({
  helperText,
  label,
  placeholder,
  value = "",
  onChange,
}: GeneratorFieldProps) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-medium text-neutral-200">{label}</span>
        <input
          className={fieldClassName}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {helperText ? (
        <span className="mt-1 block text-[11px] leading-4 text-neutral-500">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

function GeneratorTextarea({
  helperText,
  label,
  placeholder,
  value = "",
  onChange,
}: GeneratorFieldProps) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-medium text-neutral-200">{label}</span>
        <textarea
          className={cx(fieldClassName, "min-h-16 resize-y py-2 leading-5")}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      {helperText ? (
        <span className="mt-1 block text-[11px] leading-4 text-neutral-500">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

const fieldClassName =
  "mt-1 min-h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20";

function parsePreserveDetails(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasPromptGeneratorInput(formState: LucyPromptGeneratorFormState) {
  return Object.values(formState).some((value) => value?.trim().length > 0);
}
