export type LucyReferencePromptOptions = {
  baseInstruction?: string;
  gender?: "male" | "female" | "";
  age?: string;
  bodyType?: string;
  extraDetails?: string;
  referenceDescription?: string;
  hair?: string;
  glasses?: string;
  outfit?: string;
  makeup?: string;
  vibe?: string;
  background?: string;
  preserve?: string[];
};

const DEFAULT_PRESERVE_DETAILS = [
  "realistic facial detail",
  "confident expression",
  "flattering appearance",
];

export function buildLucyReferencePrompt({
  baseInstruction = "Substitute the character in the video with the described adult character",
  gender = "",
  age = "",
  bodyType = "",
  extraDetails = "",
  referenceDescription = "",
  hair = "",
  glasses = "",
  outfit = "",
  makeup = "",
  vibe = "",
  background = "",
  preserve = DEFAULT_PRESERVE_DETAILS,
}: LucyReferencePromptOptions): string {
  const parts: string[] = [];
  const instruction =
    normalizeSentence(baseInstruction) ||
    buildBaseInstruction({
      age,
      bodyType,
      extraDetails,
      gender,
    });

  parts.push(instruction);
  pushDetail(
    parts,
    referenceDescription,
    (value) => `Use the reference image for the character look: ${value}`,
  );
  pushDetail(parts, hair, (value) => `Change the character's hair to ${value}`);
  pushDetail(parts, glasses, (value) => `Set eyewear to ${value}`);
  pushDetail(parts, outfit, (value) => `Set the outfit to ${value}`);
  pushDetail(parts, makeup, (value) => `Set makeup to ${value}`);
  pushDetail(parts, background, (value) => `Set the background to ${value}`);
  pushDetail(parts, vibe, (value) => `Set the overall vibe to ${value}`);

  const preserveDetails = normalizeList(preserve);
  if (preserveDetails.length > 0) {
    parts.push(`Preserve ${preserveDetails.join(", ")}`);
  }

  return parts.map(toSentence).join(" ");
}

function buildBaseInstruction({
  age,
  bodyType,
  extraDetails,
  gender,
}: Pick<
  LucyReferencePromptOptions,
  "age" | "bodyType" | "extraDetails" | "gender"
>) {
  const characterDetails: string[] = [];
  const safeAge = normalizeAge(age);
  const normalizedBodyType = normalizeFragment(bodyType);
  const normalizedExtraDetails = normalizeFragment(extraDetails);

  if (!gender && !safeAge && !normalizedBodyType && !normalizedExtraDetails) {
    return "Substitute the character in the video with the described adult character";
  }

  characterDetails.push(gender ? `an adult ${gender}` : "an adult character");

  if (safeAge && safeAge.toLowerCase() !== "adult") {
    characterDetails.push(safeAge);
  }

  if (normalizedBodyType) {
    characterDetails.push(
      `with ${getIndefiniteArticle(normalizedBodyType)} ${normalizedBodyType} body type`,
    );
  }

  if (normalizedExtraDetails) {
    characterDetails.push(normalizedExtraDetails);
  }

  return `Substitute the character in the video with ${joinCharacterDetails(characterDetails)}`;
}

function pushDetail(
  parts: string[],
  value: string | undefined,
  createPart: (value: string) => string,
) {
  const normalizedValue = normalizeFragment(value);

  if (normalizedValue) {
    parts.push(createPart(normalizedValue));
  }
}

function normalizeSentence(value: string | undefined) {
  return normalizeFragment(value);
}

function normalizeAge(value: string | undefined) {
  const normalizedValue = normalizeFragment(value);

  if (!normalizedValue || describesMinor(normalizedValue)) {
    return "";
  }

  return normalizedValue;
}

function normalizeFragment(value: string | undefined) {
  return stripTrailingPunctuation(value?.replace(/\s+/g, " ").trim() ?? "");
}

function normalizeList(values: string[]) {
  return values.map(normalizeFragment).filter(Boolean);
}

function stripTrailingPunctuation(value: string) {
  return value.replace(/[.!?]+$/g, "").trim();
}

function toSentence(value: string) {
  const normalizedValue = stripTrailingPunctuation(value);
  return normalizedValue ? `${normalizedValue}.` : "";
}

function getIndefiniteArticle(value: string) {
  return /^[aeiou]/i.test(value) ? "an" : "a";
}

function joinCharacterDetails(characterDetails: string[]) {
  return characterDetails.reduce((description, detail, index) => {
    if (index === 0) {
      return detail;
    }

    return detail.startsWith("with ") && index === 1
      ? `${description} ${detail}`
      : `${description}, ${detail}`;
  }, "");
}

function describesMinor(value: string) {
  const normalizedValue = value.toLowerCase();

  if (
    /\b(child|kid|minor|teen|teenager|adolescent|young girl|young boy)\b/.test(
      normalizedValue,
    )
  ) {
    return true;
  }

  const firstNumber = normalizedValue.match(/\b\d{1,2}\b/);

  return firstNumber ? Number(firstNumber[0]) < 18 : false;
}
