import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from '@/app/components/Tag';

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,

  tags: ['autodocs'],

};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    name: "サンプル",
    kind: "dimension",
    simple: false,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};

export const Selcted: Story = {
  args: {
    name: "サンプル",
    kind: "dimension",
    simple: false,
    isSelected: true,
    onToggleSelect: () => alert("トグル！"),
  },
};


export const dimension: Story = {
  args: {
    name: "性別",
    kind: "dimension",
    simple: true,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};

export const region: Story = {
  args: {
    name: "都道府県",
    kind: "region",
    simple: true,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};

export const measure: Story = {
  args: {
    name: "人口",
    kind: "measure",
    simple: true,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};

export const stat: Story = {
  args: {
    name: "国勢調査",
    kind: "stat",
    simple: true,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};

export const thema: Story = {
  args: {
    name: "国勢調査",
    kind: "thema",
    simple: true,
    isSelected: false,
    onToggleSelect: () => alert("トグル！"),
  },
};



