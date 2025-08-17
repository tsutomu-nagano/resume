import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { fn } from 'storybook/test';

import { TableCard } from '@/app/components/TableCard';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof TableCard> = {
  title: 'Components/TableCard',
  component: TableCard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },


};

export default meta;
type Story = StoryObj<typeof TableCard>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    statdispid: "統計表表示ID",
    statcode: "政府統計コード",
    cycle: "調査周期",
    survey_date: "調査年月日",
    title: "表題",
    tags: [
      {name: "TEST1", kind: "dimension", simple: false, isSelected: false, onToggleSelect: () => alert("トグル！")},
      {name: "TEST2", kind: "measure", simple: false, isSelected: false, onToggleSelect: () => alert("トグル！")},
      {name: "TEST3", kind: "region", simple: false, isSelected: false, onToggleSelect: () => alert("トグル！")},
      {name: "TEST4", kind: "thema", simple: false, isSelected: false, onToggleSelect: () => alert("トグル！")},
    ],
  },
};

export const Selected: Story = {
  args: {
    statdispid: "統計表表示ID",
    statcode: "政府統計コード",
    cycle: "調査周期",
    survey_date: "調査年月日",
    title: "性別、学歴別、年齢階級別人口",
    tags: [
      {name: "TEST1", kind: "dimension", simple: false, isSelected: true, onToggleSelect: () => alert("トグル！")},
      {name: "TEST2", kind: "measure", simple: false, isSelected: true, onToggleSelect: () => alert("トグル！")},
      {name: "TEST3", kind: "region", simple: false, isSelected: true, onToggleSelect: () => alert("トグル！")},
      {name: "TEST4", kind: "thema", simple: false, isSelected: true, onToggleSelect: () => alert("トグル！")},
    ],
  },
};





