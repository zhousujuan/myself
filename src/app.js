(function () {
  const data = window.TRADE_GRAPH_DATA;
  const googleData = window.GOOGLE_PATH_DATA;
  const socialData = window.SOCIAL_PATH_DATA;
  const appShell = document.querySelector("#appShell");
  const graphControls = document.querySelector("#graphControls");
  const googleControls = document.querySelector("#googleControls");
  const socialControls = document.querySelector("#socialControls");
  const graphSurface = document.querySelector("#graphSurface");
  const googleView = document.querySelector("#googleView");
  const socialView = document.querySelector("#socialView");
  const detailsPanel = document.querySelector("#detailsPanel");
  const viewButtons = document.querySelectorAll(".view-button");
  const svg = document.querySelector("#graphSvg");
  const searchInput = document.querySelector("#searchInput");
  const relationSelect = document.querySelector("#relationSelect");
  const scoreSlider = document.querySelector("#scoreSlider");
  const scoreValue = document.querySelector("#scoreValue");
  const typeFilters = document.querySelector("#typeFilters");
  const playbookList = document.querySelector("#playbookList");
  const nodeCount = document.querySelector("#nodeCount");
  const edgeCount = document.querySelector("#edgeCount");
  const pathBar = document.querySelector("#pathBar");
  const fitButton = document.querySelector("#fitButton");
  const labelButton = document.querySelector("#labelButton");
  const exportButton = document.querySelector("#exportButton");
  const googleStageList = document.querySelector("#googleStageList");
  const googlePathRail = document.querySelector("#googlePathRail");
  const googleStageCount = document.querySelector("#googleStageCount");
  const googleQueryCount = document.querySelector("#googleQueryCount");
  const googleOutputCount = document.querySelector("#googleOutputCount");
  const googleStageTag = document.querySelector("#googleStageTag");
  const googleStageHeading = document.querySelector("#googleStageHeading");
  const googleStageSummary = document.querySelector("#googleStageSummary");
  const googleStageGoal = document.querySelector("#googleStageGoal");
  const googleStageOutput = document.querySelector("#googleStageOutput");
  const googleCheckList = document.querySelector("#googleCheckList");
  const googleActionList = document.querySelector("#googleActionList");
  const googleQueryGrid = document.querySelector("#googleQueryGrid");
  const googleOperatorGrid = document.querySelector("#googleOperatorGrid");
  const googleRoutineGrid = document.querySelector("#googleRoutineGrid");
  const socialChannelList = document.querySelector("#socialChannelList");
  const socialChannelRail = document.querySelector("#socialChannelRail");
  const socialChannelCount = document.querySelector("#socialChannelCount");
  const socialPromptCount = document.querySelector("#socialPromptCount");
  const socialAssetCount = document.querySelector("#socialAssetCount");
  const socialChannelTag = document.querySelector("#socialChannelTag");
  const socialChannelHeading = document.querySelector("#socialChannelHeading");
  const socialChannelSummary = document.querySelector("#socialChannelSummary");
  const socialChannelAudience = document.querySelector("#socialChannelAudience");
  const socialChannelGoal = document.querySelector("#socialChannelGoal");
  const socialSignalList = document.querySelector("#socialSignalList");
  const socialActionList = document.querySelector("#socialActionList");
  const socialPromptGrid = document.querySelector("#socialPromptGrid");
  const socialTacticGrid = document.querySelector("#socialTacticGrid");
  const socialRoutineGrid = document.querySelector("#socialRoutineGrid");

  const detailType = document.querySelector("#detailType");
  const detailTitle = document.querySelector("#detailTitle");
  const detailSummary = document.querySelector("#detailSummary");
  const fitMeter = document.querySelector("#fitMeter");
  const intentMeter = document.querySelector("#intentMeter");
  const effortMeter = document.querySelector("#effortMeter");
  const fitScore = document.querySelector("#fitScore");
  const intentScore = document.querySelector("#intentScore");
  const effortScore = document.querySelector("#effortScore");
  const insightList = document.querySelector("#insightList");
  const actionList = document.querySelector("#actionList");
  const neighborList = document.querySelector("#neighborList");

  const nodeById = new Map(data.nodes.map((node) => [node.id, node]));
  const categories = data.categories;
  const state = {
    view: "graph",
    activeTypes: new Set(Object.keys(categories)),
    relation: "all",
    query: "",
    minScore: 0,
    selectedId: "growth-system",
    googleStageId: googleData.stages[0].id,
    socialChannelId: socialData.channels[0].id,
    labelsVisible: true,
    playbookId: null,
    draggedId: null
  };

  const typeOrder = ["system", "customer", "market", "signal", "channel", "asset", "operation", "metric"];
  const groupAngles = {
    customer: -135,
    market: -86,
    signal: -38,
    channel: 20,
    asset: 75,
    operation: 132,
    metric: 178
  };

  const positions = buildPositions();
  hydrateViewControls();
  hydrateControls();
  hydrateGooglePath();
  hydrateSocialPath();
  render();
  selectNode("growth-system");

  function hydrateViewControls() {
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });
    setView("graph");
  }

  function setView(view) {
    state.view = view;
    appShell.classList.toggle("is-google-view", view === "google");
    appShell.classList.toggle("is-social-view", view === "social");
    graphControls.classList.toggle("is-hidden", view !== "graph");
    googleControls.classList.toggle("is-hidden", view !== "google");
    socialControls.classList.toggle("is-hidden", view !== "social");
    graphSurface.hidden = view !== "graph";
    detailsPanel.hidden = view !== "graph";
    googleView.hidden = view !== "google";
    socialView.hidden = view !== "social";

    viewButtons.forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (view === "google") {
      renderGooglePath();
    }

    if (view === "social") {
      renderSocialPath();
    }
  }

  function hydrateControls() {
    Object.entries(data.relationTypes).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      relationSelect.append(option);
    });

    typeOrder.forEach((type) => {
      const category = categories[type];
      const count = data.nodes.filter((node) => node.type === type).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button";
      button.setAttribute("aria-pressed", "true");
      button.dataset.type = type;
      button.innerHTML = `
        <span class="filter-dot" style="--dot-color:${category.color}"></span>
        <span>${category.label}</span>
        <span class="filter-count">${count}</span>
      `;
      button.addEventListener("click", () => {
        if (state.activeTypes.has(type)) {
          state.activeTypes.delete(type);
        } else {
          state.activeTypes.add(type);
        }
        if (!state.activeTypes.size) {
          state.activeTypes.add(type);
        }
        render();
      });
      typeFilters.append(button);
    });

    data.playbooks.forEach((playbook) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "playbook-button";
      button.dataset.playbook = playbook.id;
      button.innerHTML = `<span>${playbook.label}</span><span class="playbook-count">${playbook.nodes.length}</span>`;
      button.addEventListener("click", () => {
        state.playbookId = state.playbookId === playbook.id ? null : playbook.id;
        if (state.playbookId) {
          state.selectedId = playbook.nodes[0];
        }
        render();
        selectNode(state.selectedId);
      });
      playbookList.append(button);
    });

    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim().toLowerCase();
      const firstMatch = visibleNodes().find((node) => matchesQuery(node));
      if (firstMatch) {
        state.selectedId = firstMatch.id;
      }
      render();
      selectNode(state.selectedId);
    });

    relationSelect.addEventListener("change", (event) => {
      state.relation = event.target.value;
      render();
    });

    scoreSlider.addEventListener("input", (event) => {
      state.minScore = Number(event.target.value);
      scoreValue.textContent = state.minScore;
      render();
    });

    fitButton.addEventListener("click", () => {
      Object.assign(positions, buildPositions());
      state.query = "";
      state.relation = "all";
      state.minScore = 0;
      state.playbookId = null;
      state.activeTypes = new Set(Object.keys(categories));
      searchInput.value = "";
      relationSelect.value = "all";
      scoreSlider.value = "0";
      scoreValue.textContent = "0";
      render();
      selectNode("growth-system");
    });

    labelButton.addEventListener("click", () => {
      state.labelsVisible = !state.labelsVisible;
      labelButton.classList.toggle("is-active", state.labelsVisible);
      render();
    });

    exportButton.addEventListener("click", exportGraph);
    labelButton.classList.add("is-active");
  }

  function hydrateGooglePath() {
    googleStageList.innerHTML = "";
    googleData.stages.forEach((stage, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "google-stage-nav";
      button.dataset.stage = stage.id;
      button.innerHTML = `
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${stage.title}</strong>
      `;
      button.addEventListener("click", () => {
        state.googleStageId = stage.id;
        renderGooglePath();
      });
      googleStageList.append(button);
    });

    googleOperatorGrid.innerHTML = "";
    googleData.operators.forEach((operator) => {
      const card = document.createElement("article");
      card.className = "operator-card";
      card.innerHTML = `
        <strong>${operator.name}</strong>
        <code>${operator.command}</code>
        <p>${operator.note}</p>
      `;
      googleOperatorGrid.append(card);
    });

    googleRoutineGrid.innerHTML = "";
    googleData.routine.forEach((item) => {
      const row = document.createElement("article");
      row.className = "routine-row";
      row.innerHTML = `
        <span>${item.time}</span>
        <strong>${item.task}</strong>
        <p>${item.result}</p>
      `;
      googleRoutineGrid.append(row);
    });

    renderGooglePath();
  }

  function hydrateSocialPath() {
    socialChannelList.innerHTML = "";
    socialData.channels.forEach((channel, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "social-channel-nav";
      button.dataset.channel = channel.id;
      button.innerHTML = `
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${channel.tag}</strong>
      `;
      button.addEventListener("click", () => {
        state.socialChannelId = channel.id;
        renderSocialPath();
      });
      socialChannelList.append(button);
    });

    socialTacticGrid.innerHTML = "";
    socialData.tactics.forEach((tactic) => {
      const card = document.createElement("article");
      card.className = "operator-card";
      card.innerHTML = `
        <strong>${tactic.name}</strong>
        <code>${tactic.command}</code>
        <p>${tactic.note}</p>
      `;
      socialTacticGrid.append(card);
    });

    socialRoutineGrid.innerHTML = "";
    socialData.routine.forEach((item) => {
      const row = document.createElement("article");
      row.className = "routine-row";
      row.innerHTML = `
        <span>${item.time}</span>
        <strong>${item.task}</strong>
        <p>${item.result}</p>
      `;
      socialRoutineGrid.append(row);
    });

    renderSocialPath();
  }

  function renderGooglePath() {
    const activeStage = googleData.stages.find((stage) => stage.id === state.googleStageId) || googleData.stages[0];
    state.googleStageId = activeStage.id;

    googleStageCount.textContent = googleData.stages.length;
    googleQueryCount.textContent = googleData.stages.reduce((sum, stage) => sum + stage.queries.length, 0);
    googleOutputCount.textContent = googleData.assets.length;

    googleStageList.querySelectorAll(".google-stage-nav").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.stage === activeStage.id);
    });

    googlePathRail.innerHTML = "";
    googleData.stages.forEach((stage, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "google-stage-card";
      button.dataset.stage = stage.id;
      button.innerHTML = `
        <span class="stage-number">${String(index + 1).padStart(2, "0")}</span>
        <strong>${stage.title}</strong>
        <p>${stage.signals.join(" / ")}</p>
      `;
      button.classList.toggle("is-active", stage.id === activeStage.id);
      button.addEventListener("click", () => {
        state.googleStageId = stage.id;
        renderGooglePath();
      });
      googlePathRail.append(button);
    });

    googleStageTag.textContent = activeStage.tag;
    googleStageHeading.textContent = activeStage.title;
    googleStageSummary.textContent = activeStage.summary;
    googleStageGoal.textContent = activeStage.goal;
    googleStageOutput.textContent = activeStage.output;

    renderList(googleCheckList, activeStage.checks);
    renderList(googleActionList, activeStage.actions);

    googleQueryGrid.innerHTML = "";
    activeStage.queries.forEach((query) => {
      const card = document.createElement("article");
      card.className = "query-card";
      card.innerHTML = `
        <span>${query.label}</span>
        <code>${query.command}</code>
        <p>${query.use}</p>
      `;
      googleQueryGrid.append(card);
    });
  }

  function renderSocialPath() {
    const activeChannel = socialData.channels.find((channel) => channel.id === state.socialChannelId) || socialData.channels[0];
    state.socialChannelId = activeChannel.id;

    socialChannelCount.textContent = socialData.channels.length;
    socialPromptCount.textContent = socialData.channels.reduce((sum, channel) => sum + channel.prompts.length, 0);
    socialAssetCount.textContent = socialData.assets.length;

    socialChannelList.querySelectorAll(".social-channel-nav").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.channel === activeChannel.id);
    });

    socialChannelRail.innerHTML = "";
    socialData.channels.forEach((channel) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "social-channel-card";
      button.dataset.channel = channel.id;
      button.innerHTML = `
        <span class="stage-number">${channel.tag}</span>
        <strong>${channel.title}</strong>
        <p>${channel.signals.join(" / ")}</p>
      `;
      button.classList.toggle("is-active", channel.id === activeChannel.id);
      button.addEventListener("click", () => {
        state.socialChannelId = channel.id;
        renderSocialPath();
      });
      socialChannelRail.append(button);
    });

    socialChannelTag.textContent = activeChannel.tag;
    socialChannelHeading.textContent = activeChannel.title;
    socialChannelSummary.textContent = activeChannel.summary;
    socialChannelAudience.textContent = activeChannel.audience;
    socialChannelGoal.textContent = activeChannel.goal;

    renderList(socialSignalList, activeChannel.checks);
    renderList(socialActionList, activeChannel.actions);

    socialPromptGrid.innerHTML = "";
    activeChannel.prompts.forEach((prompt) => {
      const card = document.createElement("article");
      card.className = "query-card";
      card.innerHTML = `
        <span>${prompt.label}</span>
        <code>${prompt.text}</code>
        <p>${prompt.use}</p>
      `;
      socialPromptGrid.append(card);
    });
  }

  function renderList(container, items) {
    container.innerHTML = "";
    items.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      container.append(item);
    });
  }

  function buildPositions() {
    const layout = {};
    const center = { x: 560, y: 355 };
    layout["growth-system"] = { ...center };

    typeOrder
      .filter((type) => type !== "system")
      .forEach((type) => {
        const nodes = data.nodes.filter((node) => node.type === type);
        const baseAngle = (groupAngles[type] * Math.PI) / 180;
        const spread = nodes.length > 6 ? 0.72 : 0.42;
        const radius = type === "metric" ? 420 : type === "channel" && nodes.length > 6 ? 350 : 330;
        nodes.forEach((node, index) => {
          const offset = nodes.length === 1 ? 0 : (index / (nodes.length - 1) - 0.5) * spread;
          const angle = baseAngle + offset;
          const ringOffset = index % 2 === 0 ? -22 : 24;
          layout[node.id] = {
            x: center.x + Math.cos(angle) * (radius + ringOffset),
            y: center.y + Math.sin(angle) * (radius + ringOffset)
          };
        });
      });

    return layout;
  }

  function getFiltered() {
    const activePlaybook = data.playbooks.find((item) => item.id === state.playbookId);
    const playbookSet = activePlaybook ? new Set(activePlaybook.nodes.concat("growth-system")) : null;

    const nodes = data.nodes.filter((node) => {
      if (!state.activeTypes.has(node.type)) return false;
      if (node.priority < state.minScore) return false;
      if (playbookSet && !playbookSet.has(node.id)) return false;
      if (state.query && !matchesQuery(node)) return false;
      return true;
    });
    const nodeSet = new Set(nodes.map((node) => node.id));
    const edges = data.edges.filter((edge) => {
      if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) return false;
      if (state.relation !== "all" && edge.relation !== state.relation) return false;
      return true;
    });

    return { nodes, edges, nodeSet };
  }

  function visibleNodes() {
    return getFiltered().nodes;
  }

  function matchesQuery(node) {
    if (!state.query) return true;
    const haystack = [node.label, node.summary, ...(node.tags || [])].join(" ").toLowerCase();
    return haystack.includes(state.query);
  }

  function render() {
    const { nodes, edges, nodeSet } = getFiltered();
    if (!nodeSet.has(state.selectedId) && nodes.length) {
      state.selectedId = nodes[0].id;
    }

    updateButtons();
    nodeCount.textContent = `${nodes.length} 个节点`;
    edgeCount.textContent = `${edges.length} 条关系`;
    svg.classList.toggle("hide-labels", !state.labelsVisible);
    svg.innerHTML = "";

    const defs = createSvg("defs");
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9aa8ba"></path>
      </marker>
    `;
    svg.append(defs);

    const edgeGroup = createSvg("g", { class: "edges" });
    const labelGroup = createSvg("g", { class: "edge-labels" });
    const nodeGroup = createSvg("g", { class: "nodes" });
    svg.append(edgeGroup, labelGroup, nodeGroup);

    const selectedNeighbors = getNeighbors(state.selectedId);
    const selectedRelated = new Set([state.selectedId, ...selectedNeighbors.map((node) => node.id)]);

    edges.forEach((edge) => {
      const source = positions[edge.source];
      const target = positions[edge.target];
      const line = createSvg("line", {
        class: classNames("edge", !selectedRelated.has(edge.source) && !selectedRelated.has(edge.target) ? "is-dimmed" : ""),
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        "stroke-width": Math.max(1.4, edge.weight * 0.52),
        "marker-end": "url(#arrow)"
      });
      edgeGroup.append(line);

      const label = createSvg("text", {
        class: classNames("edge-label", !selectedRelated.has(edge.source) && !selectedRelated.has(edge.target) ? "is-dimmed" : ""),
        x: (source.x + target.x) / 2,
        y: (source.y + target.y) / 2 - 6,
        "text-anchor": "middle"
      });
      label.textContent = data.relationTypes[edge.relation];
      labelGroup.append(label);
    });

    nodes.forEach((node) => {
      const pos = positions[node.id];
      const radius = node.id === "growth-system" ? 31 : 17 + Math.round(node.priority / 18);
      const related = selectedRelated.has(node.id);
      const group = createSvg("g", {
        class: classNames("node", node.id === state.selectedId ? "is-selected" : "", !related ? "is-dimmed" : ""),
        transform: `translate(${pos.x}, ${pos.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": node.label,
        "data-id": node.id,
        style: `--node-color:${categories[node.type].color}`
      });

      group.append(
        createSvg("circle", { r: radius }),
        textSvg(String(node.priority), { class: "node-score", y: 4, "text-anchor": "middle" }),
        textSvg(node.label, { x: radius + 8, y: 4 })
      );

      group.addEventListener("click", () => selectNode(node.id));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node.id);
        }
      });
      group.addEventListener("pointerdown", (event) => startDrag(event, node.id));
      nodeGroup.append(group);
    });

    renderPath();
  }

  function updateButtons() {
    typeFilters.querySelectorAll(".filter-button").forEach((button) => {
      button.setAttribute("aria-pressed", String(state.activeTypes.has(button.dataset.type)));
    });
    playbookList.querySelectorAll(".playbook-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.playbook === state.playbookId);
    });
  }

  function selectNode(id) {
    const node = nodeById.get(id);
    if (!node) return;
    state.selectedId = id;
    const category = categories[node.type];
    detailType.textContent = category.label;
    detailType.style.background = category.color;
    detailTitle.textContent = node.label;
    detailSummary.textContent = node.summary;

    setMetric(fitMeter, fitScore, node.metrics.fit);
    setMetric(intentMeter, intentScore, node.metrics.intent);
    setMetric(effortMeter, effortScore, node.metrics.effort);

    insightList.innerHTML = "";
    node.insights.forEach((insight) => {
      const item = document.createElement("li");
      item.textContent = insight;
      insightList.append(item);
    });

    actionList.innerHTML = "";
    node.actions.forEach((action) => {
      const item = document.createElement("li");
      item.textContent = action;
      actionList.append(item);
    });

    neighborList.innerHTML = "";
    getNeighbors(id).forEach((neighbor) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "neighbor-button";
      button.innerHTML = `
        <span class="node-dot" style="--dot-color:${categories[neighbor.type].color}"></span>
        <span>${neighbor.label}</span>
      `;
      button.addEventListener("click", () => selectNode(neighbor.id));
      neighborList.append(button);
    });

    render();
  }

  function setMetric(meter, label, value) {
    meter.style.width = `${value}%`;
    label.textContent = value;
  }

  function getNeighbors(id) {
    const neighborIds = new Set();
    data.edges.forEach((edge) => {
      if (edge.source === id) neighborIds.add(edge.target);
      if (edge.target === id) neighborIds.add(edge.source);
    });
    return [...neighborIds].map((neighborId) => nodeById.get(neighborId)).filter(Boolean);
  }

  function renderPath() {
    pathBar.innerHTML = "";
    const activePlaybook = data.playbooks.find((item) => item.id === state.playbookId);
    const path = activePlaybook ? activePlaybook.nodes : shortestPath("growth-system", state.selectedId);
    const fullPath = activePlaybook && activePlaybook.nodes[0] !== "growth-system" ? ["growth-system", ...path] : path;

    fullPath.forEach((id, index) => {
      const node = nodeById.get(id);
      if (!node) return;
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "path-pill";
      pill.textContent = node.label;
      pill.title = node.label;
      pill.addEventListener("click", () => selectNode(node.id));
      pathBar.append(pill);

      if (index < fullPath.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "path-arrow";
        arrow.textContent = "→";
        pathBar.append(arrow);
      }
    });
  }

  function shortestPath(start, target) {
    if (start === target) return [start];
    const queue = [[start]];
    const visited = new Set([start]);
    while (queue.length) {
      const path = queue.shift();
      const last = path[path.length - 1];
      for (const neighbor of getNeighbors(last)) {
        if (visited.has(neighbor.id)) continue;
        const nextPath = [...path, neighbor.id];
        if (neighbor.id === target) return nextPath;
        visited.add(neighbor.id);
        queue.push(nextPath);
      }
    }
    return [target];
  }

  function startDrag(event, id) {
    state.draggedId = id;
    event.currentTarget.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const point = svgPoint(moveEvent);
      positions[id] = {
        x: Math.max(40, Math.min(1080, point.x)),
        y: Math.max(40, Math.min(680, point.y))
      };
      render();
    };

    const onUp = () => {
      state.draggedId = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function svgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }

  function exportGraph() {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trade-lead-knowledge-graph.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function createSvg(tag, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        element.setAttribute(key, value);
      }
    });
    return element;
  }

  function textSvg(content, attributes = {}) {
    const element = createSvg("text", attributes);
    element.textContent = content;
    return element;
  }

  function classNames(...names) {
    return names.filter(Boolean).join(" ");
  }
})();
