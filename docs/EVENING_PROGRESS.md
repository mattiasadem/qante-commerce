# Evening progress

HEAD main: 2354d4e — merchant Siparişler Toplu teslim (fulfill_all). Filter chips pick shipped set; bulk marks fulfilled on local order ledger (ikas_written false). Brief truncate on 17515e0 restored same SHA family. No qante.vercel.app. Parent e9abcbb (API) + 2354d4e (UI).

## Today
- 2354d4e / e9abcbb Toplu teslim fulfill_all
- 79a15c6 Stok Toplu yenile restock_all
- af08563 Toplu kargola ship_all

## Smoke
1. /merchant/siparisler → chip Kargoda
2. Toplu teslim (N) — flash + status Teslim
3. /siparis live chips advance to Teslim
