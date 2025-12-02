import { App, Modal, Notice, TextComponent, ButtonComponent } from "obsidian";

export class InputPromptModal extends Modal {
  result: string | null = null;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Enter new note title" });

    const inputWrapper = contentEl.createDiv();
    inputWrapper.style.marginBottom = "1em";

    const input = new TextComponent(inputWrapper);
    input.inputEl.style.width = "100%";
    input.inputEl.focus();

    input.onChange((value) => {
      this.result = value;
    });

    input.inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.submit();
      }
    });

    new ButtonComponent(contentEl)
      .setButtonText("Create")
      .setCta()
      .onClick(() => this.submit());
  }

  submit() {
    if (this.result && this.result.trim() !== "") {
      this.close();
      this.onSubmit(this.result.trim());
    } else {
      new Notice("Please enter a title.");
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}