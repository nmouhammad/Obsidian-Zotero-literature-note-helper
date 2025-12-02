// === Modal to choose topics (for literature note) from all available topics ===

import { App, ButtonComponent, Modal } from "obsidian";
import { TopicChipSelector } from "../components/TopicChipSelector";
import { formatTopicLink } from "../utils";

export class TopicMultiSelectModal extends Modal {
  allTopics: string[];
  initialTopics: string[] = [];
  onSubmit: (selectedTopics: string[]) => void;
  selector: TopicChipSelector;

  constructor(app: App, allTopics: string[], onSubmit: (selectedTopics: string[]) => void, initialTopics: string[] = []) {
    super(app);
    this.allTopics = allTopics;
    this.onSubmit = onSubmit;
    this.initialTopics = initialTopics.map(formatTopicLink);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Select Topics" });

    this.selector = new TopicChipSelector(contentEl, this.allTopics);
    this.selector.setInitialTopics(this.initialTopics);
    const buttonWrapper = contentEl.createDiv();
    buttonWrapper.style.display = "flex";
    buttonWrapper.style.justifyContent = "flex-end";
    buttonWrapper.style.marginTop = "1em";

    new ButtonComponent(buttonWrapper)
      .setButtonText("Add Topics")
      .setCta()
      .onClick(() => {
        this.close();
        this.onSubmit(this.selector.getSelectedTopics());
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}