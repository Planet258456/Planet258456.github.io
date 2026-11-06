# 📚 ScholarVault - 論文收藏庫與文獻管理網頁

ScholarVault 是一個輕量、美觀且功能齊全的單頁式文獻與論文管理工具。完全無需安裝後端資料庫或複雜環境，雙擊 `index.html` 即可在任何主流瀏覽器中直接運行！

---

## ✨ 核心特色

1. **📑 快速收藏論文**
   - 支援輸入論文網址、標題、作者、發表年份、會議/期刊 (Venue)、PDF 直連。
   - **arXiv 智慧識別**：輸入 `https://arxiv.org/abs/...` 後點擊「自動識別」，會自動計算 PDF 網址與期刊來源。
   - **多維度分類**：設定閱讀狀態（想讀、研讀中、已讀、參考文獻）與 1~5 星級重要度。
   - **標籤 Tags**：自由打上標籤（如 AI, LLM, Transformer），點擊卡片標籤即可一秒篩選相關論文。

2. **🔍 即時全文搜尋與多條件篩選**
   - 支援依論文標題、作者名、會議名稱、標籤與個人筆記內容進行即時模糊搜尋。
   - 提供依收藏日期、發表年份、星級評分、標題 A-Z 排序。

3. **📝 摘要與研讀筆記**
   - 記錄核心貢獻 (TL;DR / Abstract) 與個人啟發筆記 (Notes)。

4. **🎓 學術引用一鍵生成 (BibTeX & APA)**
   - 每一篇文獻都能點擊「引用」按鈕，立即生成標準的 **BibTeX** 或 **APA** 引用格式，並提供一鍵複製按鈕。
   - 支援一鍵匯出整庫的 `.bib` 檔案，方便匯入 LaTeX / Overleaf / Zotero。

5. **💾 資料安全與本地儲存**
   - 所有資料安全存放在您電腦的瀏覽器 `LocalStorage` 中，離線也能使用。
   - 提供「匯出 JSON 備份」與「匯入備份（支援合併或覆蓋）」，不怕換電腦或遺失資料。

6. **🎨 舒適視覺與雙視圖切換**
   - 提供**精美卡片視圖**與**高效表格清單視圖**。
   - 支援**深色模式 (Dark Mode)** 與**淺色模式 (Light Mode)** 切換，夜間讀論文更舒適。

---

## 🚀 如何使用

1. **直接開啟**：
   在檔案總管中進入 `C:\Users\SWORD 17\.gemini\antigravity\scratch\paper-vault\`，直接按兩下 `index.html` 即可在瀏覽器開啟。

2. **（可選）以本地 HTTP 伺服器開啟**：
   在終端機中執行：
   ```bash
   cd "C:\Users\SWORD 17\.gemini\antigravity\scratch\paper-vault"
   python -m http.server 8080
   ```
   然後在瀏覽器打開 `http://localhost:8080` 即可。

---

## 📁 檔案結構

```
paper-vault/
├── index.html        # 網頁結構與各模態彈窗 (Modal)
├── styles.css        # 現代化排版、深淺色主題切換、卡片與表格樣式
├── app.js            # 資料邏輯、LocalStorage、arXiv 解析、引用生成
└── README.md         # 說明文件
```
