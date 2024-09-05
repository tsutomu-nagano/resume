// src/app/page.tsx

import StatList from './components/StatList';
import TableList from './components/TableList'

// import Footer from './components/Footer'

export default async function HomePage() {


  return (
    <div className="mx-4">
      <TableList />
    </div>
  );
}

