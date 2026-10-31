# HLA Global SEO V5.2 Website

本版以附件 `HLA_Global_SEO_V5.1_Website.zip` 為唯一修改母版，依 `HLA_SEO_Strategy(1).docx` 完成品牌網站的 SEO 與內容導覽改善。

保留原有品牌主視覺、八大專業服務頁、32 篇法律文章、律師資料及全部圖片與字型。網站正式網址沿用 `https://www.hlaglobal.com.tw/`。

## 開啟與發布

1. 解壓縮後，開啟 `website/index.html` 即可查看靜態網站；分類篩選與站內搜尋需要啟用 JavaScript。
2. 正式發布時，將 `website` 資料夾內的完整內容放到網站根目錄，勿把外層版本資料夾當成網址的一部分。
3. `documentation` 是管理與驗收資料，請保留供事務所或網站維護者使用，無須公開上傳。

網站為 HTML、CSS、JavaScript 靜態檔案，不需要安裝套件或重新編譯。Google 地圖、LINE、社群連結與分析服務需要網路。

## 本版重點

- 首頁及八大服務頁重新配置 Title、Description、H1/H2 與服務導言；首頁品牌標語保留。
- 32 篇文章逐一配置主要搜尋問題、主要服務及適切的第二服務，強化文章、服務與作者間的導覽。
- 八大文章分類對應八大服務；共有繼承不動產歸入不動產，並保留家事服務連結。
- 保留四個可直接讀取的文章列表頁，各有自己的 Canonical；分類使用同頁篩選，舊分類參數仍可使用。
- 補充 Service、CollectionPage、ItemList 與文章麵包屑資料；同步 Sitemap 與站內搜尋索引。
- 聯絡頁增加大眾運輸、步行、開車導航、官方停車查詢與到訪提醒，保留既有辦公室實景。
- 保留分析同意機制，增加文章閱讀、分類與交通導航事件；案件內容與搜尋文字不納入新事件。

## 驗證及後續工作

已通過 21 項靜態檢查、22 項程式互動回歸測試與 5 個 JavaScript 檔案語法檢查。所有原有圖片與字型檔案，以及主樣式表，均與 V5.1 逐一比對一致。

本次環境沒有可用的瀏覽器驗證能力，未執行桌面或手機的實際畫面渲染，也未測量 Lighthouse 或 Core Web Vitals。發布後請依 `documentation/Deployment_and_QA.md` 補做實機與線上檢查。

Google 商家、GSC、GA4 的帳戶狀態與資料未經本次登入檢查；對應設定與基準值工作列於 `documentation/Google_Backend_Checklist.md`。未宣稱已調整商家後台、已重新收錄或已提升排名。

法律文章的原有內文、作者、審核署名及法規來源保留；本次不是法律內容的重新審核。文章的「頁面更新」日期反映分類、導覽及 metadata 的調整。

## 交付內容

| 路徑 | 用途 |
| --- | --- |
| `website/` | 完整可發布網站與圖片、字型及程式資產 |
| `documentation/Implementation_Checklist.md` | 改善計畫逐項對照與修改範圍 |
| `documentation/keyword-intent-matrix.csv` | 42 個核心頁面與文章的搜尋意圖配置 |
| `documentation/article-link-matrix.csv` | 32 篇文章主題、服務、作者、延伸閱讀及原有法規來源 |
| `documentation/category-service-map.csv` | 八大分類、服務對應與文章數 |
| `documentation/Google_Backend_Checklist.md` | Google 商家與搜尋分析後台待辦 |
| `documentation/measurement-baseline.csv` | 成效基準值空白表，供填入真實後台資料 |
| `documentation/Deployment_and_QA.md` | 發布與實機驗收說明 |
| `documentation/static-validation-report.json` | 靜態驗證紀錄與驗證限制 |
| `documentation/interaction-validation-report.json` | 分類與分析事件的程式回歸測試結果 |
| `documentation/change-manifest.json` | 與 V5.1 比較的檔案異動與雜湊 |

