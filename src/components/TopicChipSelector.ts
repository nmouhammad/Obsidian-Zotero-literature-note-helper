export class TopicChipSelector {
  container: HTMLElement;
  input: HTMLInputElement;
  suggestionBox: HTMLElement;
  chipContainer: HTMLElement;
  allTopics: string[];
  selectedTopics: Set<string> = new Set();

  constructor(parent: HTMLElement, allTopics: string[]) {
    this.allTopics = allTopics;
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
    this.input.oninput = () => {
      const query = this.input.value.toLowerCase();
      const suggestions = this.allTopics.filter(t =>
        t.toLowerCase().includes(query) && !this.selectedTopics.has(t)
      );

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
