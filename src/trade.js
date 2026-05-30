const navLinks = [...document.querySelectorAll(".nav-link")];
      const routeLinks = [...document.querySelectorAll('a[href^="#"]')];
      const views = [...document.querySelectorAll(".view")];
      const companionBlocks = [...document.querySelectorAll("[data-parent-view]")];
      const validViewIds = new Set(views.map((view) => view.id));

      function getRequestedView() {
        const requestedId = window.location.hash.replace("#", "");
        return validViewIds.has(requestedId) ? requestedId : "overview";
      }

      function renderView(viewId, shouldScroll = false) {
        views.forEach((view) => {
          const isCurrent = view.id === viewId;
          view.hidden = !isCurrent;
          view.classList.toggle("is-current", isCurrent);
        });

        companionBlocks.forEach((block) => {
          const isCurrent = block.dataset.parentView === viewId;
          block.hidden = !isCurrent;
          block.classList.toggle("is-current", isCurrent);
        });

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${viewId}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });

        document.body.dataset.currentView = viewId;

        if (shouldScroll) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }

      const cardPrefixToView = {
        A: "acquisition",
        T: "outreach",
        P: "process",
        H: "handoff",
        L: "handoff",
      };

      function exitDetail() {
        delete document.body.dataset.detailCard;
        document.querySelectorAll(".channel-card--full.detail-hidden").forEach((c) => {
          c.classList.remove("detail-hidden");
        });
        document.querySelectorAll(".detail-bar").forEach((bar) => {
          bar.hidden = true;
        });
      }

      function enterDetail(cardId, opts = {}) {
        const { pushState = false } = opts;
        const target = document.getElementById(cardId);
        if (!target) return false;

        const sectionEl = target.closest(".section.view");
        if (!sectionEl) return false;
        const parentView = sectionEl.id;

        renderView(parentView, false);

        const cards = [...sectionEl.querySelectorAll(".channel-card--full[id]")];
        cards.forEach((card) => {
          card.classList.toggle("detail-hidden", card.id !== cardId);
        });

        target.dataset.collapsed = "false";
        document.body.dataset.detailCard = cardId;

        const detailBar = sectionEl.querySelector(".detail-bar");
        if (detailBar) {
          detailBar.hidden = false;
          const idx = cards.findIndex((c) => c.id === cardId);
          const titleEl = target.querySelector(".sop-header h3");
          const title = titleEl ? titleEl.textContent.trim() : cardId;
          const posEl = detailBar.querySelector(".detail-position");
          const titleNode = detailBar.querySelector(".detail-title");
          if (posEl) posEl.textContent = `${idx + 1} / ${cards.length}`;
          if (titleNode) titleNode.textContent = title;

          const prevId = idx > 0 ? cards[idx - 1].id : "";
          const nextId = idx >= 0 && idx < cards.length - 1 ? cards[idx + 1].id : "";
          const prevBtn = detailBar.querySelector(".detail-prev");
          const nextBtn = detailBar.querySelector(".detail-next");
          if (prevBtn) {
            prevBtn.dataset.target = prevId;
            prevBtn.disabled = !prevId;
          }
          if (nextBtn) {
            nextBtn.dataset.target = nextId;
            nextBtn.disabled = !nextId;
          }
        }

        if (pushState) history.pushState(null, "", `#${cardId}`);
        window.scrollTo({ top: 0, behavior: "auto" });
        return true;
      }

      function navigateTo(hashId, options = {}) {
        const { pushState = false, allowScroll = true } = options;

        if (!hashId) {
          exitDetail();
          renderView("overview", allowScroll);
          return;
        }

        if (validViewIds.has(hashId)) {
          exitDetail();
          if (pushState) history.pushState(null, "", `#${hashId}`);
          renderView(hashId, allowScroll);
          return;
        }

        const prefix = hashId.charAt(0).toUpperCase();
        const parentView = cardPrefixToView[prefix];
        if (!parentView) {
          exitDetail();
          renderView("overview", allowScroll);
          return;
        }

        enterDetail(hashId, { pushState });
      }

      function backToListFromDetail() {
        const cardId = document.body.dataset.detailCard;
        if (!cardId) return;
        const prefix = cardId.charAt(0).toUpperCase();
        const parentView = cardPrefixToView[prefix] || "overview";
        navigateTo(parentView, { pushState: true });
      }

      routeLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const hashId = link.getAttribute("href").replace("#", "");
          if (!hashId) return;

          if (validViewIds.has(hashId)) {
            event.preventDefault();
            navigateTo(hashId, { pushState: true });
            return;
          }

          const prefix = hashId.charAt(0).toUpperCase();
          if (!cardPrefixToView[prefix]) return;

          event.preventDefault();
          navigateTo(hashId, { pushState: true });
        });
      });

      document.addEventListener("click", (event) => {
        const back = event.target.closest(".detail-back");
        if (back) {
          event.preventDefault();
          backToListFromDetail();
          return;
        }

        const navBtn = event.target.closest(".detail-prev, .detail-next");
        if (navBtn && !navBtn.disabled) {
          const targetId = navBtn.dataset.target;
          if (targetId) {
            event.preventDefault();
            navigateTo(targetId, { pushState: true });
          }
        }
      });

      document.addEventListener("keydown", (event) => {
        if (!document.body.dataset.detailCard) return;
        if (event.target.matches("input, textarea, [contenteditable]")) return;

        if (event.key === "Escape") {
          event.preventDefault();
          backToListFromDetail();
        } else if (event.key === "ArrowLeft") {
          const bar = document.querySelector(".detail-bar:not([hidden])");
          if (!bar) return;
          const prevBtn = bar.querySelector(".detail-prev");
          if (prevBtn && !prevBtn.disabled && prevBtn.dataset.target) {
            event.preventDefault();
            navigateTo(prevBtn.dataset.target, { pushState: true });
          }
        } else if (event.key === "ArrowRight") {
          const bar = document.querySelector(".detail-bar:not([hidden])");
          if (!bar) return;
          const nextBtn = bar.querySelector(".detail-next");
          if (nextBtn && !nextBtn.disabled && nextBtn.dataset.target) {
            event.preventDefault();
            navigateTo(nextBtn.dataset.target, { pushState: true });
          }
        }
      });

      window.addEventListener("popstate", () => {
        navigateTo(window.location.hash.replace("#", ""), { pushState: false });
      });
      window.addEventListener("hashchange", () => {
        navigateTo(window.location.hash.replace("#", ""), { pushState: false });
      });
      navigateTo(window.location.hash.replace("#", ""), { pushState: false, allowScroll: false });

      document.querySelectorAll("[data-copy]").forEach((node) => {
        node.addEventListener("click", async () => {
          const text = node.textContent.trim();
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); } catch {}
            document.body.removeChild(ta);
          }
          node.classList.add("is-copied");
          clearTimeout(node._copyTimer);
          node._copyTimer = setTimeout(() => node.classList.remove("is-copied"), 1400);
        });
      });

      document.querySelectorAll(".channel-card--full[id]").forEach((card) => {
        const lists = [...card.querySelectorAll(".check-list")];
        lists.forEach((list, listIdx) => {
          const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
          boxes.forEach((box, boxIdx) => {
            const key = `sop:${card.id}:${listIdx}:${boxIdx}`;
            if (localStorage.getItem(key) === "1") box.checked = true;
            box.addEventListener("change", () => {
              localStorage.setItem(key, box.checked ? "1" : "0");
            });
          });
        });

        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "sop-reset";
        reset.textContent = "重置本卡勾选";
        reset.addEventListener("click", () => {
          card.querySelectorAll('.check-list input[type="checkbox"]').forEach((box) => {
            box.checked = false;
          });
          Object.keys(localStorage)
            .filter((k) => k.startsWith(`sop:${card.id}:`))
            .forEach((k) => localStorage.removeItem(k));
        });
        const footer = card.querySelector(".sop-footer");
        if (footer) footer.appendChild(reset);
      });

      document.querySelectorAll(".channel-card--full[id]").forEach((card) => {
        if (!card.querySelector(".sop-block--always")) return;
        const stored = localStorage.getItem(`sop-collapsed:${card.id}`);
        card.dataset.collapsed = stored === null ? "true" : stored;
      });

      (function setupThemeToggle() {
        const root = document.documentElement;
        const toggle = document.getElementById("themeToggle");
        const STORAGE_KEY = "trade-theme";
        const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

        function resolveInitialTheme() {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored === "light" || stored === "dark") return stored;
          return mediaQuery.matches ? "light" : "dark";
        }

        function applyTheme(theme) {
          root.dataset.theme = theme;
          if (toggle) {
            const icon = toggle.querySelector(".theme-toggle-icon");
            const label = toggle.querySelector(".theme-toggle-label");
            if (icon) icon.textContent = theme === "light" ? "☀️" : "🌙";
            if (label) label.textContent = theme === "light" ? "亮色主题" : "深色主题";
            toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
          }
        }

        applyTheme(resolveInitialTheme());

        if (toggle) {
          toggle.addEventListener("click", () => {
            const next = root.dataset.theme === "light" ? "dark" : "light";
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
          });
        }

        mediaQuery.addEventListener("change", (event) => {
          if (localStorage.getItem(STORAGE_KEY)) return;
          applyTheme(event.matches ? "light" : "dark");
        });
      })();

      document.addEventListener("click", (event) => {
        const toggle = event.target.closest(".sop-toggle");
        if (toggle) {
          const card = toggle.closest(".channel-card--full[id]");
          if (!card) return;
          const next = card.dataset.collapsed === "true" ? "false" : "true";
          card.dataset.collapsed = next;
          localStorage.setItem(`sop-collapsed:${card.id}`, next);
          return;
        }

        const bulk = event.target.closest("[data-bulk]");
        if (bulk) {
          const action = bulk.dataset.bulk;
          const section = bulk.closest(".section");
          if (!section) return;
          const value = action === "expand" ? "false" : "true";
          section.querySelectorAll(".channel-card--full[id]").forEach((card) => {
            if (!card.querySelector(".sop-block--always")) return;
            card.dataset.collapsed = value;
            localStorage.setItem(`sop-collapsed:${card.id}`, value);
          });
        }
      });

      (function setupGlossary() {
        const glossary = {
          "bio": "Instagram / TikTok 个人主页顶部的「简介区」——品牌定位 + 外链入口（官网 / 邮箱 / WhatsApp / Linktree）通常都挂在这里，是反查联系方式的第一站。",
          "DM": "Direct Message，社交平台站内私信（IG / TikTok / X / LinkedIn 等）。冷启动触达中替代邮件的常用渠道，但默认进 Requests 文件夹。",
          "FYP": "For You Page，TikTok 的算法推荐主页。TikTok 不靠搜索，靠 FYP 算法分发新内容，所以搜索权重比 IG 低很多。",
          "D2C": "Direct-to-Consumer，品牌直接面向消费者销售，不走传统批发 / 经销商渠道。多见于独立站 / Shopify 品牌。",
          "B2B": "Business-to-Business，企业对企业的销售模式（区别于 B2C / D2C）。RFQ、行业展会、批发平台都属于 B2B 场景。",
          "RFQ": "Request for Quote，B2B 平台上买家发布的「求购询价」。回复 RFQ 是被动获客的一种方式，对应 A07 渠道。",
          "ICP": "Ideal Customer Profile，理想客户画像——你最想签下的客户长什么样（行业、规模、地区、决策人）。",
          "CRM": "Customer Relationship Management，客户关系管理系统（HubSpot / Pipedrive / Salesforce 等），用于沉淀线索和触达历史。",
          "SOP": "Standard Operating Procedure，标准作业流程——把「怎么做」沉淀成可复用、可勾选的步骤清单。",
          "boutique": "精品买手店 / 设计师选品店。体量小但客单价高、选品挑剔，是 D2C 品牌的主要分销渠道之一。",
          "Highlight": "Instagram 主页置顶的「永久 Story 精选」。品牌常用来分类陈列 stockist / wholesale / press / lookbook 等正式入口。",
          "Tagged": "Instagram 上「被他人标记」的列表。可反查品牌的经销商、联名方、KOL 合作和大客户。",
          "Mentions": "Instagram 中被他人 @ 的提及记录，可顺藤摸瓜找到合作方与客户。",
          "stockist": "经销商 / 卖该品牌的实体店或买手店名单。品牌官网 / IG Highlight 常有 stockist 入口，是反查渠道客户的金矿。",
          "lookbook": "品牌产品图册（按季度 / 系列整理的款式合集），通常 PDF 或网页形式，能看出对方主营品类和价格段。",
          "Linktree": "把多个链接聚合到一页的工具（linktr.ee）。IG bio 只能挂一个链接，品牌常用 Linktree 串联官网 / 邮箱 / Shopify / wholesale 表单。",
          "Reels": "Instagram 的短视频功能（对标 TikTok）。算法分发权重高于普通 Posts，搜索新账号时优先看 Reels。",
          "Story": "Instagram / Facebook 的限时动态（24 小时自动消失）。可用 Story 反应破冰，但引用 Story 的触达要在 24 小时内发出。",
          "TikTok Shop": "TikTok 内置的电商功能（含橱窗 / 直播购物）。开通后能在 bio 挂外链、提升账号信任度，是判断 TikTok 商家成熟度的关键信号。",
          "handle": "社交账号的唯一标识符（@username）。CRM 建档时优先记 handle 而不是显示名，因为显示名会改、handle 是主键。",
          "hashtag": "话题标签（# 开头），用于发现内容和反查同品类账号。在 IG / TikTok 找客户时是关键的搜索入口之一。"
        };

        const SKIP_TAGS = new Set([
          "CODE", "PRE", "SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT",
          "INPUT", "TEXTAREA", "SELECT", "OPTION", "TITLE"
        ]);

        function shouldSkip(node) {
          let el = node.parentNode;
          while (el && el !== document.body) {
            if (el.nodeType === 1) {
              if (SKIP_TAGS.has(el.tagName)) return true;
              if (el.classList && el.classList.contains("term")) return true;
              if (el.hasAttribute && el.hasAttribute("data-copy")) return true;
            }
            el = el.parentNode;
          }
          return false;
        }

        const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
        const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const pattern = new RegExp(
          "(?<![A-Za-z0-9])(" + escaped.join("|") + ")(?![A-Za-z0-9])",
          "g"
        );

        const root = document.querySelector("main") || document.body;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });

        const targets = [];
        let cur;
        while ((cur = walker.nextNode())) targets.push(cur);

        for (const textNode of targets) {
          const text = textNode.nodeValue;
          pattern.lastIndex = 0;
          if (!pattern.test(text)) continue;
          pattern.lastIndex = 0;
          const frag = document.createDocumentFragment();
          let lastIdx = 0;
          let m;
          while ((m = pattern.exec(text))) {
            const matchStart = m.index;
            const matchEnd = matchStart + m[1].length;
            if (matchStart > lastIdx) {
              frag.appendChild(document.createTextNode(text.slice(lastIdx, matchStart)));
            }
            const span = document.createElement("span");
            span.className = "term";
            span.setAttribute("data-tip", glossary[m[1]]);
            span.setAttribute("tabindex", "0");
            span.textContent = m[1];
            frag.appendChild(span);
            lastIdx = matchEnd;
          }
          if (lastIdx < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx)));
          }
          textNode.parentNode.replaceChild(frag, textNode);
        }
      })();
