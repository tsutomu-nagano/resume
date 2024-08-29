// src/app/page.tsx

import StatList from './components/StatList';
import TableList from './components/TableList'
import Drawer from "./components/Drawer";

// import Footer from './components/Footer'

export default async function HomePage() {


  return (
      <div className="flex flex-row gap-10">
        <StatList />
        <TableList />
      </div>
  );
}

