// Drawer.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchCountResult } from '@/app/components/SearchCountResult';

const meta: Meta<typeof SearchCountResult> = {
  title: 'Components/SearchCountResult',
  component: SearchCountResult,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SearchCountResult>;

export const Default: Story = {
  args: {
    stat: 200,
    db: 100
  },
};
