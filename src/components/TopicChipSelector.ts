export class TopicChipSelector {
  container: HTMLElement;
  input: HTMLInputElement;
  suggestionBox: HTMLElement;
  chipContainer: HTMLElement;
  allTopics: string[];
  selectedTopics: Set<string> = new Set();

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
    const renderSuggestionsForQuery = (query: string) => {
      const q = query.toLowerCase();
      const suggestions = this.allTopics
        .filter(t => t.toLowerCase().includes(q) && !this.selectedTopics.has(t))
        .slice()
        .sort((a, b) => {
          const key = (s: string) => s.replace(/ - Topic$/i, "").toLowerCase();
          const ka = key(a);
          const kb = key(b);
          if (ka < kb) return -1;
          if (ka > kb) return 1;
          return 0;
        });

      this.suggestionBox.empty();

      suggestions.forEach(s => {
        const displayText = s.replace(/ - Topic$/, "");
        const item = this.suggestionBox.createDiv({ cls: "suggestion-item", text: displayText });
        item.onclick = () => {
          this.selectedTopics.add(s);
          this.input.value = "";
          this.suggestionBox.empty();
          this.renderChips();
        };
      });

      if (suggestions.length === 0) {
        this.suggestionBox.createDiv({ cls: "no-suggestions", text: "No suggestions found" });
      }
    };

    // Show suggestions when typing
    this.input.oninput = () => {
      renderSuggestionsForQuery(this.input.value);
    };

    // Also show all suggestions (except already selected) when field is focused,
    // even if the input is empty.
    this.input.onfocus = () => {
      renderSuggestionsForQuery(this.input.value);
    };
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
    topics.forEach(t => this.selectedTopics.add(t));
    this.renderChips();
  }
}
