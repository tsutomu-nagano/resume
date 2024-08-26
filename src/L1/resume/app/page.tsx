// src/app/page.tsx
import { gql } from '@apollo/client';
import { createApolloClient } from '@/lib/apolloClient';

import SearchItems from './components/SearchItems';
import SearchCondition from './components/SearchCondition';
import StatList from './components/StatList';
import TableList from './components/TableList';
import SearchItemSelector from './components/SearchItemSelector';


export default async function HomePage() {

  return (
    <div>
      <div className="mb-5 navbar bg-base-100">
      <a className="btn btn-ghost text-xl">ReSUME L1</a>
      <SearchItemSelector labelja = "統計調査" labelen = "" resource_name= 'statlist' resource_field='statname' kind="stat" />
      <SearchItemSelector labelja = "集計事項" labelen = "" resource_name= 'table_measure' resource_field='name' kind="measure"  />
      <SearchItemSelector labelja = "分類事項" labelen = "" resource_name= 'table_dimension' resource_field='class_name' kind="dimension"  />
      </div>
    <div className="flex flex-col gap-10">
          <SearchItems names={["TEST","HOGE"]} />
          {/* <SearchCondition /> */}
          <div className="flex flex-row gap-10">
              <StatList />
              <TableList />
          </div>
        </div>

    </div>
  );
}

