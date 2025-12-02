import { App, ButtonComponent, Modal } from "obsidian";
import { TopicChipSelector } from "../components/TopicChipSelector";

// === Modal to select topics for the point notes based on the topics in the parent literature note ===
export class TopicSelectorModal extends Modal {
  allTopics: string[];
  initialTopics: string[];
  onSubmit: (selectedTopics: string[]) => void;
  selector: TopicChipSelector;

  constructor(app: App, allTopics: string[], initialTopics: string[], onSubmit: (selectedTopics: string[]) => void) {
    super(app);
    this.allTopics = allTopics;
    this.initialTopics = initialTopics;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Select Topics to Transfer" });

    this.selector = new TopicChipSelector(contentEl, this.allTopics);
    this.selector.setInitialTopics(this.initialTopics);

    const buttonWrapper = contentEl.createDiv();
    buttonWrapper.style.display = "flex";
    buttonWrapper.style.justifyContent = "flex-end";
    buttonWrapper.style.marginTop = "1em";

    new ButtonComponent(buttonWrapper)
      .setButtonText("Create Note")
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