import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from '@/app/components/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,

  tags: ['autodocs'],

};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    kind: "dimension",
    name: "TEST",
    isSelected: false,
    children: (
      <div>
        <p>ドロワーの内容がここに入ります。</p>
        <p>必要に応じてコンテンツを追加してください。</p>
      </div>
    ),
  },
};

export const Selected: Story = {
  args: {
    kind: "dimension",
    name: "TEST",
    isSelected: true,
  },
};

