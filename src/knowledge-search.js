/**
 * 知识库首页交互：渲染卡片 + 搜索 + 分类/状态/标签筛选。
 * 纯前端，无后端依赖。数据来自 window.KNOWLEDGE（knowledge-index.js）。
 */
(function () {
  "use strict";

  var DATA = window.KNOWLEDGE || [];
  var resultsEl = document.getElementById("kResults");
  var searchEl = document.getElementById("kSearch");
  var catBarEl = document.getElementById("kCatBar");
  var statusBarEl = document.getElementById("kStatusBar");
  var countEl = document.getElementById("kCount");
  var emptyEl = document.getElementById("kEmpty");

  if (!resultsEl) return;

  var state = { q: "", cat: "all", status: "all", tag: "" };

  // ---- 工具 ----
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function matches(item) {
    if (state.status !== "all" && item.status !== state.status) return false;
    if (state.tag && (item.tags || []).indexOf(state.tag) === -1) return false;
    if (state.q) {
      var hay = (
        item.title +
        " " +
        (item.summary || "") +
        " " +
        (item.tags || []).join(" ")
      ).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  // ---- 卡片 ----
  function buildCard(item, accent) {
    var hasPage = !!item.url;
    var card = el(hasPage ? "a" : "div", "k-card k-card--" + accent);
    if (hasPage) {
      card.href = item.url;
    } else {
      card.classList.add("k-card--draft");
    }

    var top = el("div", "k-card-top");
    var status = el("span", "k-status k-status--" + (item.status === "已沉淀" ? "done" : "learning"), item.status);
    top.appendChild(status);
    if (item.forBoss) top.appendChild(el("span", "k-boss", "职业证据"));
    card.appendChild(top);

    card.appendChild(el("strong", null, item.title));
    card.appendChild(el("p", null, item.summary || ""));

    if (item.tags && item.tags.length) {
      var tagsWrap = el("div", "k-tags");
      item.tags.forEach(function (t) {
        var chip = el("button", "k-tag", "#" + t);
        chip.type = "button";
        chip.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          state.tag = state.tag === t ? "" : t;
          render();
        });
        if (state.tag === t) chip.classList.add("is-active");
        tagsWrap.appendChild(chip);
      });
      card.appendChild(tagsWrap);
    }

    var foot = el("div", "k-card-foot");
    foot.appendChild(el("span", "k-updated", item.updated ? "更新 " + item.updated : "敬请期待"));
    foot.appendChild(el("span", "k-go", hasPage ? "进入 →" : "整理中"));
    card.appendChild(foot);

    return card;
  }

  // ---- 渲染 ----
  function render() {
    resultsEl.innerHTML = "";
    var total = 0;

    DATA.forEach(function (group) {
      if (state.cat !== "all" && state.cat !== group.key) return;

      var visible = group.items.filter(matches);
      if (!visible.length) return;
      total += visible.length;

      var section = el("section", "k-group");

      var head = el("div", "k-group-head");
      var title = el("h2", null);
      title.appendChild(el("span", "k-group-icon", group.icon));
      title.appendChild(document.createTextNode(" " + group.label));
      head.appendChild(title);
      head.appendChild(el("p", null, group.desc));
      section.appendChild(head);

      var grid = el("div", "k-grid");
      visible.forEach(function (item) {
        grid.appendChild(buildCard(item, group.accent));
      });
      section.appendChild(grid);

      resultsEl.appendChild(section);
    });

    if (countEl) countEl.textContent = total + " 篇";
    if (emptyEl) emptyEl.hidden = total !== 0;
    syncFilterUI();
  }

  function syncFilterUI() {
    if (catBarEl) {
      Array.prototype.forEach.call(catBarEl.querySelectorAll("[data-cat]"), function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-cat") === state.cat);
      });
    }
    if (statusBarEl) {
      Array.prototype.forEach.call(statusBarEl.querySelectorAll("[data-status]"), function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-status") === state.status);
      });
    }
  }

  // ---- 初始化筛选条 ----
  function initBars() {
    var cats = [{ key: "all", label: "全部" }].concat(
      DATA.map(function (g) {
        return { key: g.key, label: g.icon + " " + g.label };
      })
    );
    cats.forEach(function (c) {
      var b = el("button", "k-chip", c.label);
      b.type = "button";
      b.setAttribute("data-cat", c.key);
      b.addEventListener("click", function () {
        state.cat = c.key;
        render();
      });
      catBarEl.appendChild(b);
    });

    [
      { key: "all", label: "全部状态" },
      { key: "在学", label: "在学" },
      { key: "已沉淀", label: "已沉淀" },
    ].forEach(function (s) {
      var b = el("button", "k-chip k-chip--sm", s.label);
      b.type = "button";
      b.setAttribute("data-status", s.key);
      b.addEventListener("click", function () {
        state.status = s.key;
        render();
      });
      statusBarEl.appendChild(b);
    });
  }

  if (searchEl) {
    searchEl.addEventListener("input", function () {
      state.q = searchEl.value.trim().toLowerCase();
      render();
    });
  }

  initBars();
  render();
})();
