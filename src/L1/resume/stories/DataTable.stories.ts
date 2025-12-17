import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from '@/app/components/DimensionItemTable/data-table';
import { DimensionItem, columns } from '@/app/components/DimensionItemTable/columns';


async function getData(): Promise<DimensionItem[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "TEST",
    },
    {
      id: "728ed52f",
      name: "TEAB",
    },
    {
      id: "728ed52f",
      name: "TCST",
    },
    {
      id: "728ed52f",
      name: "TEXT",
    },
    // ...
  ]
}

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,

  tags: ['autodocs'],

};
export default meta;


const data = await getData()


type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  args: {
    columns: columns,
    data: data
  },
};


