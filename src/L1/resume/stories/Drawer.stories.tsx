// Drawer.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from '@/app/components/Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  decorators: [
    (StoryFn, context) => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div>
          <button className={`btn m-1`} onClick={() => setIsOpen(true)}>Open Drawer</button>
          <StoryFn args={{
            ...context.args, 
            isOpen, onToggle: () => setIsOpen((prev) => !prev)
             }} />
        </div>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    id: 'drawer-1',
    title: "サンプルドロワー",
    children: (
      <div>
        <p>ドロワーの内容がここに入ります。</p>
        <p>必要に応じてコンテンツを追加してください。</p>
      </div>
    ),
    // isOpen: true
  },
};

export const TEST: Story = {
  args: {
    id: 'drawer-1',
    title: 'サンプルドロワー',
    // isOpen: true
  },
};
