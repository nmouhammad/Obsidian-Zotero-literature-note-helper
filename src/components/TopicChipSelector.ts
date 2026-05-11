export class TopicChipSelector {
  container: HTMLElement;
  input: HTMLInputElement;
  suggestionBox: HTMLElement;
  chipContainer: HTMLElement;
  allTopics: string[];
  selectedTopics: Set<string> = new Set();
  // Map from normalized display name to canonical topic string (with suffix)
  topicDisplayMap: Map<string, string>;

  constructor(parent: HTMLElement, allTopics: string[]) {
    // Sort topics A -> Z, case-insensitive, ignoring the trailing " - Topic" suffix
    this.allTopics = allTopics.slice().sort((a, b) => {
      const key = (s: string) => s.replace(/ - Topic$/i, "").toLowerCase();
      const ka = key(a);
      const kb = key(b);
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return 0;
    });
    // Build a map from normalized display name to canonical topic string
    this.topicDisplayMap = new Map();
    this.allTopics.forEach(t => {
      const display = t.replace(/ - Topic$/i, "").toLowerCase();
      this.topicDisplayMap.set(display, t);
    });
    this.container = parent.createDiv({ cls: "topic-chip-selector" });

    this.chipContainer = this.container.createDiv({ cls: "chip-container" });
    this.input = this.container.createEl("input", {
      type: "text",
      placeholder: "Type to search topics...",
    });
    this.suggestionBox = this.container.createDiv({ cls: "suggestion-box" });

    this.setupInput();
    this.renderChips();
  }

  setupInput() {
    const renderSuggestionsForQuery = (query = "") => {
      const q = query.toLowerCase();
      // Show all topics matching query, regardless of selection
      const suggestions = this.allTopics
        .filter(t => t.toLowerCase().includes(q))
        .slice()
        .sort((a: string, b: string) => {
          const key = (s: string) => s.replace(/ - Topic$/i, "").toLowerCase();
          const ka = key(a);
          const kb = key(b);
          if (ka < kb) return -1;
          if (ka > kb) return 1;
          return 0;
        });

      this.suggestionBox.empty();

      if (suggestions.length === 0) {
        this.suggestionBox.createDiv({ cls: "no-suggestions", text: "No suggestions found" });
        return;
      }

      suggestions.forEach(s => {
        const displayText = s.replace(/ - Topic$/, "");
        const isSelected = this.selectedTopics.has(s);
        const item = this.suggestionBox.createDiv({ cls: "suggestion-item" });
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.cursor = "pointer";
        // Text
        const label = item.createDiv({ text: displayText, cls: "suggestion-label" });
        label.style.flex = "1";
        // Tick or empty
        const tick = item.createDiv({ cls: "suggestion-tick" });
        tick.style.marginLeft = "0.5em";
        tick.textContent = isSelected ? "✔️" : "";
        // Toggle selection on click
        item.onclick = () => {
          if (isSelected) {
            this.selectedTopics.delete(s);
          } else {
            this.selectedTopics.add(s);
          }
          // Do not clear input or hide suggestions
          this.renderChips();
          renderSuggestionsForQuery(this.input.value);
        };
        // Optionally, highlight selected
        if (isSelected) {
          item.classList.add("selected-suggestion");
        }
      });
    };

    // Show suggestions when typing
    this.input.oninput = () => {
      renderSuggestionsForQuery(this.input.value);
    };

    // Show all suggestions (matching input) when focused
    this.input.onfocus = () => {
      renderSuggestionsForQuery(this.input.value);
    };

    // Always show suggestions initially
    renderSuggestionsForQuery("");
  }

  renderChips() {
    this.chipContainer.empty();
    this.selectedTopics.forEach(topic => {
      const displayText = topic.replace(/ - Topic$/, ""); // Strip suffix

      const chip = this.chipContainer.createDiv({ cls: "chip" });
      chip.setText(displayText);

      const removeBtn = chip.createEl("span", { text: "❌", cls: "remove-chip" });
      removeBtn.onclick = () => {
        this.selectedTopics.delete(topic);
        this.renderChips();
      };
    });
  }


  getSelectedTopics(): string[] {
    return Array.from(this.selectedTopics);
  }

  setInitialTopics(topics: string[]) {
    // Normalize initial topics to canonical topic strings from allTopics
    topics.forEach(t => {
      // Try to match by display name (case-insensitive, ignoring suffix)
      const display = t.replace(/ - Topic$/i, "").toLowerCase();
      const canonical = this.topicDisplayMap.get(display);
      if (canonical) {
        this.selectedTopics.add(canonical);
      } else {
        // fallback: add as-is
        this.selectedTopics.add(t);
      }
    });
    this.renderChips();
  }
}
