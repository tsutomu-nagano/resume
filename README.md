# resume
- `re`structure `s`tatistical data `u`sing `me`tadata

## Layer 1 
- e-StatのAPIで取得可能なデータをgraphQLへ変換
- 全ての情報が必要ではないため検索に有用と思われる情報を取捨選択
- 機械的なメタデータの付与

- https://resume-rho-five.vercel.app



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
| Backend | HasuraCloud(graphQL) + Neon(postgres) | 
| Worker | R + github Action |
| deploy | Vercel |

- 基本的にクラウドサービスはどれも無料プランです。

## Note
- このサービスは、政府統計総合窓口(e-Stat)のAPI機能を使用していますが、サービスの内容は国によって保証されたものではありません。