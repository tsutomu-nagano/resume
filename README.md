# resume
- `re`structure `s`tatistical data `u`sing `me`tadata

## Layer 1 
- e-StatのAPIで取得可能なデータをgraphQLへ変換
- 全ての情報が必要ではないため検索に有用と思われる情報を取捨選択
- 機械的なメタデータの付与
- 検索アプリ：https://resume-rho-five.vercel.app



## Layer 2 (Future)
- Layer 1 で整理したメタデータに対して人による整理を追加する
- RDF化してより機械判読性を向上
- ユーザにより同一メタデータの整理を可能とする（コミュニティ的な機能が必要か）
- ベースの考え方はデジタル庁のGIFを参考にする
  - 従業者数（男） = 従業者数（集計事項） + 性別（分類事項） + 男（性別の項目） といった感じで定義できるようにしたい

## System Configuration

| 要素 | 技術やサービスなど | 
| ----- | --------------- | 
| Frontend | Nextjs + TypeScript |
| CSS | daisyUI + Tailwind | 
| Backend | HasuraCloud(graphQL) + OCI(Oracle) | 
| deploy | Vercel |

- 基本的にクラウドサービスはどれも無料プランです。
- データを管理しているリポジトリが別にあります [resume-data](https://github.com/tsutomu-nagano/resume-data)
  - github-action + R + Python で日時で更新のあったデータをOracleのDBに反映しています 

## Security
- Hasura の admin secret はブラウザに公開しないよう、Next.js の `/api/graphql` 経由でサーバー側からのみ送信します。
- `/api/graphql` では mutation / subscription / introspection を拒否し、必要に応じて `HASURA_GRAPHQL_ROLE` で読み取り専用ロールを指定できます。
- ローカルでは `src/L1/resume/.env.example` を `.env.local` にコピーし、`HASURA_ADMIN_SECRET` を設定してください。
- `NEXT_PUBLIC_` から始まる環境変数はクライアントへ公開されるため、シークレットには使用しません。

## Note
- このサービスは、政府統計総合窓口(e-Stat)のAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。
