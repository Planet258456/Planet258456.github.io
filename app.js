/**
 * ScholarVault - 論文收藏庫前端邏輯
 */

// 預設示範資料
const DEMO_PAPERS = [
  {
    id: "demo-paper-1",
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
    authors: "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
    year: 2017,
    venue: "NeurIPS 2017",
    status: "completed",
    rating: 5,
    tags: ["Transformer", "Attention", "NLP", "Deep Learning"],
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    notes: "Transformer 架構的開山鼻祖！自注意力機制 (Self-Attention) 與多頭注意力 (Multi-Head Attention) 的核心思想非常優雅，顛覆了過往 RNN/LSTM 在序列建模上的統治地位。",
    createdAt: new Date("2024-01-10").toISOString()
  },
  {
    id: "demo-paper-2",
    title: "Deep Residual Learning for Image Recognition (ResNet)",
    url: "https://arxiv.org/abs/1512.03385",
    pdfUrl: "https://arxiv.org/pdf/1512.03385.pdf",
    authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
    year: 2016,
    venue: "CVPR 2016 (Best Paper)",
    status: "reference",
    rating: 5,
    tags: ["Computer Vision", "CNN", "ResNet", "Deep Learning"],
    abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs.",
    notes: "殘差跳躍連接 (Skip Connection) 解決了深層網路梯度消失與退化問題，成功訓練超過 152 層的超深網路，至今仍是經典 Baseline。",
    createdAt: new Date("2024-02-15").toISOString()
  },
  {
    id: "demo-paper-3",
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    url: "https://arxiv.org/abs/2106.09685",
    pdfUrl: "https://arxiv.org/pdf/2106.09685.pdf",
    authors: "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen",
    year: 2021,
    venue: "ICLR 2022",
    status: "reading",
    rating: 4,
    tags: ["LLM", "Fine-tuning", "PEFT", "LoRA"],
    abstract: "An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks. We propose Low-Rank Adaptation, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.",
    notes: "參數量大幅降低的微調神器 (PEFT)。核心是利用低秩分解矩陣 A、B 來近似參數更新變化量 ΔW = B × A，大幅降低顯存需求。",
    createdAt: new Date("2024-03-20").toISOString()
  }
];

const POPULAR_TAGS = ["AI", "LLM", "Transformer", "NLP", "Computer Vision", "Agent", "Diffusion", "Reinforcement Learning", "PEFT", "Survey"];

// 應用程式狀態
class PaperVaultApp {
  constructor() {
    this.papers = [];
    this.currentView = localStorage.getItem("papers_vault_view") || "grid"; // 'grid' | 'list'
    this.selectedTag = "all";
    this.currentTheme = localStorage.getItem("papers_vault_theme") || "light";

    this.initElements();
    this.loadState();
    this.bindEvents();
    this.applyTheme(this.currentTheme);
    this.render();
  }

  // 初始化 DOM 元件參考
  initElements() {
    this.paperContainer = document.getElementById("paperContainer");
    this.emptyState = document.getElementById("emptyState");
    this.emptyTitle = document.getElementById("emptyTitle");
    this.emptyDesc = document.getElementById("emptyDesc");
    this.emptyActionBtn = document.getElementById("emptyActionBtn");

    // 統計元素
    this.statTotal = document.getElementById("statTotal");
    this.statReading = document.getElementById("statReading");
    this.statUnread = document.getElementById("statUnread");
    this.statCompleted = document.getElementById("statCompleted");
    this.statReference = document.getElementById("statReference");

    // 控制項
    this.searchInput = document.getElementById("searchInput");
    this.clearSearchBtn = document.getElementById("clearSearchBtn");
    this.statusFilter = document.getElementById("statusFilter");
    this.tagFilter = document.getElementById("tagFilter");
    this.sortFilter = document.getElementById("sortFilter");
    this.viewGridBtn = document.getElementById("viewGridBtn");
    this.viewListBtn = document.getElementById("viewListBtn");

    // 標籤指示器
    this.activeTagPill = document.getElementById("activeTagPill");
    this.activeTagName = document.getElementById("activeTagName");
    this.clearTagFilterBtn = document.getElementById("clearTagFilterBtn");

    // 彈窗
    this.paperModal = document.getElementById("paperModal");
    this.paperForm = document.getElementById("paperForm");
    this.modalTitle = document.getElementById("modalTitle");
    this.openAddModalBtn = document.getElementById("openAddModalBtn");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.cancelModalBtn = document.getElementById("cancelModalBtn");
    this.detectUrlBtn = document.getElementById("detectUrlBtn");
    this.quickTagsList = document.getElementById("quickTagsList");

    // 引用彈窗
    this.citeModal = document.getElementById("citeModal");
    this.citeModalTitle = document.getElementById("citeModalTitle");
    this.closeCiteModalBtn = document.getElementById("closeCiteModalBtn");
    this.closeCiteBtn = document.getElementById("closeCiteBtn");
    this.bibtexContent = document.getElementById("bibtexContent");
    this.apaContent = document.getElementById("apaContent");
    this.copyBibtexBtn = document.getElementById("copyBibtexBtn");
    this.copyApaBtn = document.getElementById("copyApaBtn");

    // 匯入匯出
    this.exportBtn = document.getElementById("exportBtn");
    this.importBtn = document.getElementById("importBtn");
    this.fileInput = document.getElementById("fileInput");
    this.exportBibtexBtn = document.getElementById("exportBibtexBtn");
    this.loadDemoDataBtn = document.getElementById("loadDemoDataBtn");
    this.clearAllDataBtn = document.getElementById("clearAllDataBtn");

    // 主題切換
    this.themeToggleBtn = document.getElementById("themeToggleBtn");
  }

  // 載入儲存的狀態
  loadState() {
    const rawData = localStorage.getItem("papers_vault_data");
    if (rawData) {
      try {
        this.papers = JSON.parse(rawData);
      } catch (e) {
        console.error("Failed to parse papers data from localStorage:", e);
        this.papers = [...DEMO_PAPERS];
      }
    } else {
      this.papers = [...DEMO_PAPERS];
      this.saveState();
    }
  }

  // 儲存至 LocalStorage
  saveState() {
    localStorage.setItem("papers_vault_data", JSON.stringify(this.papers));
  }

  // 綁定事件監聽
  bindEvents() {
    // 搜尋與篩選
    this.searchInput.addEventListener("input", () => {
      this.clearSearchBtn.style.display = this.searchInput.value.trim() ? "block" : "none";
      this.render();
    });

    this.clearSearchBtn.addEventListener("click", () => {
      this.searchInput.value = "";
      this.clearSearchBtn.style.display = "none";
      this.searchInput.focus();
      this.render();
    });

    this.statusFilter.addEventListener("change", () => this.render());
    this.tagFilter.addEventListener("change", (e) => {
      this.selectedTag = e.target.value;
      this.updateActiveTagPill();
      this.render();
    });
    this.sortFilter.addEventListener("change", () => this.render());

    // 快速清除標籤篩選
    this.clearTagFilterBtn.addEventListener("click", () => {
      this.selectedTag = "all";
      this.tagFilter.value = "all";
      this.updateActiveTagPill();
      this.render();
    });

    // 統計卡片點擊快速篩選狀態
    document.querySelectorAll(".stat-card[data-filter-status]").forEach(card => {
      card.addEventListener("click", () => {
        const status = card.getAttribute("data-filter-status");
        this.statusFilter.value = status;
        this.render();
      });
    });

    // 視圖切換
    this.viewGridBtn.addEventListener("click", () => this.setView("grid"));
    this.viewListBtn.addEventListener("click", () => this.setView("list"));

    // 主題切換
    this.themeToggleBtn.addEventListener("click", () => {
      const nextTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.applyTheme(nextTheme);
    });

    // 彈窗開關
    this.openAddModalBtn.addEventListener("click", () => this.openPaperModal());
    this.closeModalBtn.addEventListener("click", () => this.closePaperModal());
    this.cancelModalBtn.addEventListener("click", () => this.closePaperModal());
    this.emptyActionBtn.addEventListener("click", () => this.openPaperModal());

    // 點擊背景關閉
    this.paperModal.addEventListener("click", (e) => {
      if (e.target === this.paperModal) this.closePaperModal();
    });

    // 表單提交
    this.paperForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // 網址智慧分析
    this.detectUrlBtn.addEventListener("click", () => this.handleUrlAutoDetection());

    // 引用彈窗
    this.closeCiteModalBtn.addEventListener("click", () => this.closeCiteModal());
    this.closeCiteBtn.addEventListener("click", () => this.closeCiteModal());
    this.citeModal.addEventListener("click", (e) => {
      if (e.target === this.citeModal) this.closeCiteModal();
    });
    this.copyBibtexBtn.addEventListener("click", () => this.copyToClipboard(this.bibtexContent.textContent, "BibTeX 已成功複製到剪貼簿！"));
    this.copyApaBtn.addEventListener("click", () => this.copyToClipboard(this.apaContent.textContent, "APA 引用已成功複製到剪貼簿！"));

    // 備份與還原
    this.exportBtn.addEventListener("click", () => this.exportJsonBackup());
    this.importBtn.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => this.importJsonBackup(e));
    this.exportBibtexBtn.addEventListener("click", () => this.exportAllBibtex());

    // 範例與重置
    this.loadDemoDataBtn.addEventListener("click", () => {
      if (confirm("是否載入示範文獻？這會與您目前的文獻合併。")) {
        const existingIds = new Set(this.papers.map(p => p.id));
        DEMO_PAPERS.forEach(dp => {
          if (!existingIds.has(dp.id)) this.papers.push({ ...dp, id: 'demo-' + Date.now() + Math.random().toString(36).substr(2, 4) });
        });
        this.saveState();
        this.render();
        this.showToast("已成功載入示範論文！", "success");
      }
    });

    this.clearAllDataBtn.addEventListener("click", () => {
      if (confirm("確定要清空所有收藏的論文嗎？此動作無法復原！建議先匯出備份。")) {
        this.papers = [];
        this.saveState();
        this.render();
        this.showToast("已清空所有論文資料", "error");
      }
    });

    // 全域鍵盤快捷鍵
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closePaperModal();
        this.closeCiteModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.searchInput.focus();
      }
    });

    // 渲染常用標籤晶片
    this.renderQuickTags();
  }

  // 套用主題
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("papers_vault_theme", theme);
  }

  // 切換視圖
  setView(view) {
    this.currentView = view;
    localStorage.setItem("papers_vault_view", view);
    this.viewGridBtn.classList.toggle("active", view === "grid");
    this.viewListBtn.classList.toggle("active", view === "list");
    this.render();
  }

  // 常用標籤晶片點擊
  renderQuickTags() {
    this.quickTagsList.innerHTML = POPULAR_TAGS.map(tag => `
      <span class="quick-tag-chip" data-tag="${tag}">+ ${tag}</span>
    `).join("");

    this.quickTagsList.querySelectorAll(".quick-tag-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const tag = chip.getAttribute("data-tag");
        const tagsInput = document.getElementById("paperTags");
        const currentTags = tagsInput.value.split(",").map(t => t.trim()).filter(Boolean);
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          tagsInput.value = currentTags.join(", ");
        }
      });
    });
  }

  // 智慧網址解析 (arXiv, DOI, etc.)
  handleUrlAutoDetection() {
    const urlInput = document.getElementById("paperUrl");
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
      this.showToast("請先輸入論文網址！", "error");
      return;
    }

    let detected = false;
    // 檢查是否為 arXiv
    const arxivMatch = rawUrl.match(/arxiv\.org\/(abs|pdf)\/(\d+\.\d+)(v\d+)?(\.pdf)?/i);
    if (arxivMatch) {
      const arxivId = arxivMatch[2];
      const pdfInput = document.getElementById("paperPdfUrl");
      const venueInput = document.getElementById("paperVenue");
      const tagsInput = document.getElementById("paperTags");

      if (!pdfInput.value) {
        pdfInput.value = `https://arxiv.org/pdf/${arxivId}.pdf`;
      }
      if (!venueInput.value) {
        venueInput.value = `arXiv:${arxivId}`;
      }

      // 如果網址是 pdf，自動正規化為 abs
      if (rawUrl.includes('/pdf/')) {
        urlInput.value = `https://arxiv.org/abs/${arxivId}`;
      }

      this.showToast(`已成功識別 arXiv 論文 (ID: ${arxivId})，已自動填入 PDF 與來源！`, "success");
      detected = true;
    }

    // 檢查 DOI
    const doiMatch = rawUrl.match(/doi\.org\/(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i);
    if (doiMatch) {
      const doi = doiMatch[1];
      const venueInput = document.getElementById("paperVenue");
      if (!venueInput.value) venueInput.value = `DOI: ${doi}`;
      this.showToast(`已識別 DOI: ${doi}`, "success");
      detected = true;
    }

    // 嘗試從網址推測標題
    const titleInput = document.getElementById("paperTitle");
    if (!titleInput.value) {
      try {
        const parsed = new URL(rawUrl);
        const lastPart = parsed.pathname.split("/").filter(Boolean).pop();
        if (lastPart && !lastPart.includes(".")) {
          // 清理連字號作為備用標題
          titleInput.placeholder = `可填入標題，例如：${decodeURIComponent(lastPart).replace(/[-_]/g, " ")}`;
        }
      } catch (e) {}
    }

    if (!detected) {
      this.showToast("已解析網址，請手動補齊標題與作者資訊", "info");
    }
  }

  // 取得篩選並排序後的論文列表
  getFilteredPapers() {
    const query = this.searchInput.value.trim().toLowerCase();
    const status = this.statusFilter.value;
    const sort = this.sortFilter.value;

    return this.papers.filter(paper => {
      // 狀態篩選
      if (status !== "all" && paper.status !== status) return false;

      // 標籤篩選
      if (this.selectedTag !== "all") {
        if (!paper.tags || !paper.tags.includes(this.selectedTag)) return false;
      }

      // 關鍵字搜尋
      if (query) {
        const inTitle = paper.title && paper.title.toLowerCase().includes(query);
        const inAuthors = paper.authors && paper.authors.toLowerCase().includes(query);
        const inVenue = paper.venue && paper.venue.toLowerCase().includes(query);
        const inNotes = paper.notes && paper.notes.toLowerCase().includes(query);
        const inAbstract = paper.abstract && paper.abstract.toLowerCase().includes(query);
        const inTags = paper.tags && paper.tags.some(t => t.toLowerCase().includes(query));
        if (!inTitle && !inAuthors && !inVenue && !inNotes && !inAbstract && !inTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sort === "dateDesc") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sort === "dateAsc") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sort === "yearDesc") return (b.year || 0) - (a.year || 0);
      if (sort === "yearAsc") return (a.year || 0) - (b.year || 0);
      if (sort === "ratingDesc") return (b.rating || 0) - (a.rating || 0);
      if (sort === "titleAsc") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  }

  // 更新統計資訊
  updateStats() {
    this.statTotal.textContent = this.papers.length;
    this.statReading.textContent = this.papers.filter(p => p.status === "reading").length;
    this.statUnread.textContent = this.papers.filter(p => p.status === "unread").length;
    this.statCompleted.textContent = this.papers.filter(p => p.status === "completed").length;
    this.statReference.textContent = this.papers.filter(p => p.status === "reference").length;
  }

  // 更新標籤下拉選單
  updateTagOptions() {
    const allTags = new Set();
    this.papers.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => allTags.add(t));
      }
    });

    const sortedTags = Array.from(allTags).sort();
    let optionsHtml = `<option value="all">所有標籤 (${sortedTags.length})</option>`;
    sortedTags.forEach(t => {
      const count = this.papers.filter(p => p.tags && p.tags.includes(t)).length;
      const isSelected = this.selectedTag === t ? "selected" : "";
      optionsHtml += `<option value="${this.escapeHtml(t)}" ${isSelected}>${this.escapeHtml(t)} (${count})</option>`;
    });
    this.tagFilter.innerHTML = optionsHtml;
  }

  updateActiveTagPill() {
    if (this.selectedTag !== "all") {
      this.activeTagPill.style.display = "inline-flex";
      this.activeTagName.textContent = this.selectedTag;
    } else {
      this.activeTagPill.style.display = "none";
    }
  }

  // 主渲染函數
  render() {
    this.updateStats();
    this.updateTagOptions();
    this.updateActiveTagPill();

    const filtered = this.getFilteredPapers();

    if (filtered.length === 0) {
      this.paperContainer.innerHTML = "";
      this.emptyState.style.display = "flex";
      if (this.papers.length === 0) {
        this.emptyTitle.textContent = "文獻庫目前是空的";
        this.emptyDesc.textContent = "點擊右上角「收藏新論文」或下方按鈕，開始儲存您閱讀過的或感興趣的論文！";
        this.emptyActionBtn.style.display = "inline-flex";
      } else {
        this.emptyTitle.textContent = "找不到符合條件的論文";
        this.emptyDesc.textContent = "沒有與目前搜尋條件或標籤吻合的結果，試試調整關鍵字或重置篩選。";
        this.emptyActionBtn.style.display = "none";
      }
      return;
    }

    this.emptyState.style.display = "none";

    if (this.currentView === "grid") {
      this.renderGridView(filtered);
    } else {
      this.renderListView(filtered);
    }
  }

  // 渲染卡片視圖
  renderGridView(papers) {
    this.paperContainer.className = "cards-grid";
    this.paperContainer.innerHTML = papers.map(paper => {
      const stars = "★".repeat(paper.rating || 0) + "☆".repeat(5 - (paper.rating || 0));
      const statusMeta = this.getStatusMeta(paper.status);
      
      const tagsHtml = (paper.tags && paper.tags.length > 0)
        ? paper.tags.map(t => `<button class="tag-pill" data-tag="${this.escapeHtml(t)}">${this.escapeHtml(t)}</button>`).join("")
        : "";

      return `
        <article class="paper-card" data-id="${paper.id}">
          <div>
            <div class="card-top">
              <span class="status-badge ${statusMeta.cssClass}">
                ${statusMeta.label}
              </span>
              <span class="card-stars" title="重要度：${paper.rating} 星">${stars}</span>
            </div>

            <a href="${this.escapeHtml(paper.url)}" target="_blank" rel="noopener noreferrer" class="card-title-link" title="${this.escapeHtml(paper.title)}">
              ${this.escapeHtml(paper.title)}
            </a>

            <div class="card-meta">
              ${paper.authors ? `<span class="card-meta-item" title="作者">👤 ${this.escapeHtml(paper.authors)}</span>` : ""}
              ${paper.year ? `<span class="card-meta-item" title="年份">📅 ${paper.year}</span>` : ""}
              ${paper.venue ? `<span class="card-meta-item" title="發表平台">🏛️ ${this.escapeHtml(paper.venue)}</span>` : ""}
            </div>

            ${paper.abstract ? `
              <div class="card-abstract" title="摘要">
                ${this.escapeHtml(paper.abstract)}
              </div>
            ` : ""}

            ${paper.notes ? `
              <div class="card-notes" title="研讀筆記">
                💡 ${this.escapeHtml(paper.notes)}
              </div>
            ` : ""}

            ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}
          </div>

          <div class="card-footer">
            <div class="card-external-links">
              <a href="${this.escapeHtml(paper.url)}" target="_blank" rel="noopener noreferrer" class="icon-link-btn" title="打開論文網頁">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                連結
              </a>
              ${paper.pdfUrl ? `
                <a href="${this.escapeHtml(paper.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="icon-link-btn" title="查看 PDF 原文">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  PDF
                </a>
              ` : ""}
              <button class="icon-link-btn cite-btn" data-id="${paper.id}" title="查看學術引用代碼">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"/><polyline points="15 3 21 9 9 9"/></svg>
                引用
              </button>
            </div>

            <div class="card-manage-actions">
              <button class="action-icon-btn edit-btn" data-id="${paper.id}" title="編輯論文資料">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-icon-btn delete-btn" data-id="${paper.id}" title="刪除此論文">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    this.bindCardInteractions();
  }

  // 渲染列表視圖
  renderListView(papers) {
    this.paperContainer.className = "papers-table-container";
    this.paperContainer.innerHTML = `
      <table class="papers-table">
        <thead>
          <tr>
            <th style="width: 35%;">標題與作者</th>
            <th>狀態</th>
            <th>發表年份</th>
            <th>會議 / 期刊</th>
            <th>評分</th>
            <th>標籤</th>
            <th style="text-align: right;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${papers.map(p => {
            const statusMeta = this.getStatusMeta(p.status);
            const stars = "★".repeat(p.rating || 0);
            const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag-pill" data-tag="${this.escapeHtml(t)}">${this.escapeHtml(t)}</span>`).join(" ");

            return `
              <tr data-id="${p.id}">
                <td>
                  <a href="${this.escapeHtml(p.url)}" target="_blank" class="table-title">${this.escapeHtml(p.title)}</a>
                  <div style="font-size: 0.775rem; color: var(--text-muted);">${this.escapeHtml(p.authors || "未知作者")}</div>
                </td>
                <td>
                  <span class="status-badge ${statusMeta.cssClass}">${statusMeta.label}</span>
                </td>
                <td>${p.year || "-"}</td>
                <td>${this.escapeHtml(p.venue || "-")}</td>
                <td style="color: #f59e0b;">${stars}</td>
                <td>${tags}</td>
                <td style="text-align: right;">
                  <button class="icon-link-btn cite-btn" data-id="${p.id}" title="引用">引用</button>
                  <button class="action-icon-btn edit-btn" data-id="${p.id}" title="編輯" style="display:inline-flex;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-icon-btn delete-btn" data-id="${p.id}" title="刪除" style="display:inline-flex;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  </button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;

    this.bindCardInteractions();
  }

  // 綁定卡片/清單項目內部按鈕事件
  bindCardInteractions() {
    // 標籤點擊直接篩選
    this.paperContainer.querySelectorAll(".tag-pill").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const tag = el.getAttribute("data-tag");
        this.selectedTag = tag;
        this.tagFilter.value = tag;
        this.updateActiveTagPill();
        this.render();
      });
    });

    // 編輯按鈕
    this.paperContainer.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.openPaperModal(id);
      });
    });

    // 刪除按鈕
    this.paperContainer.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const paper = this.papers.find(p => p.id === id);
        if (paper && confirm(`確定要刪除「${paper.title}」嗎？`)) {
          this.deletePaper(id);
        }
      });
    });

    // 引用按鈕
    this.paperContainer.querySelectorAll(".cite-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.openCiteModal(id);
      });
    });
  }

  // 開啟新增/編輯彈窗
  openPaperModal(paperId = null) {
    this.paperForm.reset();
    document.getElementById("paperId").value = "";

    if (paperId) {
      const paper = this.papers.find(p => p.id === paperId);
      if (paper) {
        this.modalTitle.textContent = "編輯論文資料";
        document.getElementById("paperId").value = paper.id;
        document.getElementById("paperUrl").value = paper.url || "";
        document.getElementById("paperPdfUrl").value = paper.pdfUrl || "";
        document.getElementById("paperTitle").value = paper.title || "";
        document.getElementById("paperAuthors").value = paper.authors || "";
        document.getElementById("paperYear").value = paper.year || "";
        document.getElementById("paperVenue").value = paper.venue || "";
        document.getElementById("paperStatus").value = paper.status || "unread";
        document.getElementById("paperRating").value = paper.rating || "3";
        document.getElementById("paperTags").value = (paper.tags || []).join(", ");
        document.getElementById("paperAbstract").value = paper.abstract || "";
        document.getElementById("paperNotes").value = paper.notes || "";
      }
    } else {
      this.modalTitle.textContent = "收藏新論文";
      document.getElementById("paperStatus").value = "unread";
      document.getElementById("paperRating").value = "3";
    }

    this.paperModal.classList.add("active");
    setTimeout(() => document.getElementById("paperUrl").focus(), 50);
  }

  closePaperModal() {
    this.paperModal.classList.remove("active");
  }

  // 處理表單儲存
  handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("paperId").value;
    const url = document.getElementById("paperUrl").value.trim();
    const title = document.getElementById("paperTitle").value.trim();

    if (!url || !title) {
      this.showToast("請填寫論文網址與標題！", "error");
      return;
    }

    const tagsRaw = document.getElementById("paperTags").value;
    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const paperData = {
      url,
      title,
      pdfUrl: document.getElementById("paperPdfUrl").value.trim(),
      authors: document.getElementById("paperAuthors").value.trim(),
      year: parseInt(document.getElementById("paperYear").value, 10) || null,
      venue: document.getElementById("paperVenue").value.trim(),
      status: document.getElementById("paperStatus").value,
      rating: parseInt(document.getElementById("paperRating").value, 10) || 3,
      tags,
      abstract: document.getElementById("paperAbstract").value.trim(),
      notes: document.getElementById("paperNotes").value.trim()
    };

    if (id) {
      // 編輯既有
      const idx = this.papers.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.papers[idx] = {
          ...this.papers[idx],
          ...paperData,
          updatedAt: new Date().toISOString()
        };
        this.showToast("論文更新成功！", "success");
      }
    } else {
      // 新增
      const newPaper = {
        ...paperData,
        id: "paper_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString()
      };
      this.papers.unshift(newPaper);
      this.showToast("新論文收藏成功！", "success");
    }

    this.saveState();
    this.closePaperModal();
    this.render();
  }

  // 刪除論文
  deletePaper(id) {
    this.papers = this.papers.filter(p => p.id !== id);
    this.saveState();
    this.render();
    this.showToast("論文已刪除", "info");
  }

  // 學術引用彈窗
  openCiteModal(paperId) {
    const paper = this.papers.find(p => p.id === paperId);
    if (!paper) return;

    this.citeModalTitle.textContent = `引用：「${paper.title}」`;
    
    // 生成 BibTeX
    const firstAuthor = paper.authors ? paper.authors.split(",")[0].trim().split(" ").pop().toLowerCase() : "paper";
    const citeKey = `${firstAuthor}${paper.year || new Date().getFullYear()}${paper.title.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}`;
    
    const bibtex = `@article{${citeKey},
  title={${paper.title}},
  author={${paper.authors ? paper.authors.replace(/,/g, " and") : "Unknown"}},
  journal={${paper.venue || "arXiv"}},
  year={${paper.year || new Date().getFullYear()}},
  url={${paper.url}}
}`;
    this.bibtexContent.textContent = bibtex;

    // 生成 APA
    const authorsApa = paper.authors || "Unknown Authors";
    const yearApa = paper.year ? `(${paper.year})` : "(n.d.)";
    const apa = `${authorsApa} ${yearApa}. ${paper.title}. ${paper.venue ? paper.venue + ". " : ""}${paper.url}`;
    this.apaContent.textContent = apa;

    this.citeModal.classList.add("active");
  }

  closeCiteModal() {
    this.citeModal.classList.remove("active");
  }

  // 複製文字至剪貼簿
  copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(successMsg, "success");
    }).catch(err => {
      console.error(err);
      this.showToast("複製失敗，請手動反白複製", "error");
    });
  }

  // 匯出 JSON 備份檔
  exportJsonBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.papers, null, 2));
    const downloadAnchor = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scholar_vault_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast("JSON 備份檔案已開始下載！", "success");
  }

  // 匯入 JSON 備份
  importJsonBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          const mode = confirm("點擊「確定」將合併新舊文獻，點擊「取消」將完全覆蓋目前文獻：\n確定：合併 (Merge)\n取消：覆蓋 (Replace)");
          if (mode) {
            // 合併
            const currentIds = new Set(this.papers.map(p => p.id));
            let addedCount = 0;
            importedData.forEach(item => {
              if (item.title && item.url) {
                if (!item.id || currentIds.has(item.id)) {
                  item.id = "imported_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
                }
                this.papers.push(item);
                addedCount++;
              }
            });
            this.showToast(`成功合併 ${addedCount} 篇文獻！`, "success");
          } else {
            // 覆蓋
            this.papers = importedData.filter(i => i.title && i.url);
            this.showToast(`成功匯入 ${this.papers.length} 篇文獻（已覆蓋原資料）`, "success");
          }
          this.saveState();
          this.render();
        } else {
          this.showToast("JSON 檔案格式不符合論文陣列結構！", "error");
        }
      } catch (err) {
        console.error(err);
        this.showToast("讀取檔案失敗，請確認是否為合法的 JSON 格式！", "error");
      }
      this.fileInput.value = "";
    };
    reader.readAsText(file);
  }

  // 匯出全部為 BibTeX (.bib)
  exportAllBibtex() {
    if (this.papers.length === 0) {
      this.showToast("目前沒有論文可匯出 BibTeX", "error");
      return;
    }

    let bibtexStr = `% ScholarVault Generated BibTeX Export\n% Export Date: ${new Date().toISOString()}\n\n`;
    this.papers.forEach((paper, idx) => {
      const firstAuthor = paper.authors ? paper.authors.split(",")[0].trim().split(" ").pop().toLowerCase() : "paper";
      const citeKey = `${firstAuthor}${paper.year || 2024}_${idx + 1}`;
      bibtexStr += `@article{${citeKey},\n  title={${paper.title}},\n  author={${paper.authors ? paper.authors.replace(/,/g, " and") : "Unknown"}},\n  journal={${paper.venue || "Preprint"}},\n  year={${paper.year || new Date().getFullYear()}},\n  url={${paper.url}}\n}\n\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(bibtexStr);
    const downloadAnchor = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scholar_vault_${today}.bib`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast("BibTeX (.bib) 檔案已成功匯出！", "success");
  }

  // 顯示浮動提示 Toast
  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // 狀態對應文字與樣式
  getStatusMeta(status) {
    switch (status) {
      case "reading":
        return { label: "研讀中", cssClass: "status-reading" };
      case "completed":
        return { label: "已讀", cssClass: "status-completed" };
      case "reference":
        return { label: "參考文獻", cssClass: "status-reference" };
      case "unread":
      default:
        return { label: "想讀", cssClass: "status-unread" };
    }
  }

  // HTML 逸出跳脫保護
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// 頁面載入完成後啟動應用
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PaperVaultApp();
});
