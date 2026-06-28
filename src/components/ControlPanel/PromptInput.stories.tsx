import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { getModelConfig } from "../../constants/models";
import { PromptInput } from "./PromptInput";

const lucyConfig = getModelConfig("lucy-2.1");
const vtonConfig = getModelConfig("lucy-vton-3");

const meta = {
  title: "Control Panel/PromptInput",
  component: PromptInput,
  tags: ["autodocs"],
  args: {
    helperText: lucyConfig.promptHelperText,
    label: lucyConfig.promptLabel,
    onChange: fn(),
    placeholder: lucyConfig.promptPlaceholder,
    value: lucyConfig.defaultPrompt,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm bg-neutral-950 p-4 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromptInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LucyPrompt: Story = {};

export const EmptyLucyPrompt: Story = {
  args: {
    value: "",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value ?? "");

    return (
      <PromptInput
        {...args}
        value={value}
        onChange={(nextValue) => {
          args.onChange(nextValue);
          setValue(nextValue);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const prompt = canvas.getByLabelText(/Transformation prompt/i);

    await userEvent.type(prompt, "Make the lighting cinematic");

    await expect(prompt).toHaveValue("Make the lighting cinematic");
    await expect(args.onChange).toHaveBeenLastCalledWith("Make the lighting cinematic");
  },
};

export const VtonPrompt: Story = {
  args: {
    helperText: vtonConfig.promptHelperText,
    label: vtonConfig.promptLabel,
    placeholder: vtonConfig.promptPlaceholder,
    value: "Substitute the current top with a cropped denim jacket with brass buttons.",
  },
};
