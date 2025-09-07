import type { Meta, StoryObj } from "@storybook/react";
import { Button } from '@/app/components/Button';

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,

  tags: ['autodocs'],

};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    kind: "dimension",
    name: "TEST",
    isSelected: false,
  },
};


export const Selcted: Story = {
  args: {
    kind: "dimension",
    name: "TEST",
    isSelected: true,
  },
};


