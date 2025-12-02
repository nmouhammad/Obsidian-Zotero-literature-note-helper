import { App, PluginSettingTab, Setting, SuggestModal } from 'obsidian';

export interface BulletPointMoveSettings {
  newFolder: string;
}

export const DEFAULT_SETTINGS: BulletPointMoveSettings = {
  newFolder: 'Point notes',
};

class FolderSuggestModal extends SuggestModal<string> {
  choices: string[];
  onChooseCb: (choice: string) => void;

  constructor(app: App, choices: string[], onChoose: (choice: string) => void) {
    super(app);
    this.choices = choices;
    this.onChooseCb = onChoose;
  }

  getSuggestions(query: string): string[] {
    const q = query.toLowerCase();
    return this.choices.filter((c) => c.toLowerCase().includes(q));
  }

  renderSuggestion(value: string, el: HTMLElement) {
    el.createEl('div', { text: value || '(root)' });
  }

  onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
    this.onChooseCb(item);
  }
}

export class BulletPointMoveSettingTab extends PluginSettingTab {
  plugin: Plugin & { settings: BulletPointMoveSettings; saveSettings: () => Promise<void> };

  constructor(app: App, plugin: Plugin & { settings: BulletPointMoveSettings; saveSettings: () => Promise<void> }) {
    super(app, plugin as any);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Text field is read-only; users open the chooser via the inline button
    const setting = new Setting(containerEl)
      .setName('Point note folder')
      .setDesc('Folder where new point notes will be created')
      .addText((text) =>
        text
          .setPlaceholder('Select folder...')
          .setValue(this.plugin.settings.newFolder || '')
          .setDisabled(true)
      )
      .addButton((btn) =>
        btn.setIcon('pencil').setTooltip('Change folder').onClick(async () => {
          // Collect all folders in the vault, including truly empty ones when the adapter exposes them
          const folderPaths = new Set<string>();

          // Try to use the adapter.list('') which returns folders even if empty (adapter APIs vary by platform)
          try {
            const adapter = (this.app.vault.adapter as any);
            if (adapter && typeof adapter.list === 'function') {
              const listResult = await adapter.list('');
              // listResult.folders is sometimes provided
              if (listResult && Array.isArray(listResult.folders)) {
                for (const f of listResult.folders) {
                  // normalize backslashes to slashes
                  folderPaths.add((f || '').replace(/\\/g, '/'));
                }
              } else if (listResult && Array.isArray(listResult.files)) {
                // Fall back: derive folders from file paths
                for (const filePath of listResult.files) {
                  const idx = filePath.lastIndexOf('/');
                  const folder = idx === -1 ? '' : filePath.substring(0, idx);
                  folderPaths.add(folder);
                }
              }
            }
          } catch (e) {
            // adapter.list may not be available on all adapters; ignore and fallback
          }

          // Fallback/additional: derive folders from known files so at least folders that contain files are present
          const files = this.app.vault.getFiles();
          for (const f of files) {
            const idx = f.path.lastIndexOf('/');
            const folder = idx === -1 ? '' : f.path.substring(0, idx);
            folderPaths.add(folder);
          }

          // Ensure root is represented (use empty string for root)
          if (!folderPaths.has('')) folderPaths.add('');

          // Exclude internal/hidden folders (those starting with '.'), e.g. .obsidian, .trash, etc.
          const choices = Array.from(folderPaths)
            .map((p) => (p || '').replace(/\\/g, '/'))
            .filter((p) => {
              if (!p) return true; // root
              const first = p.split('/')[0];
              return !first.startsWith('.');
            })
            .sort((a, b) => a.localeCompare(b));
          const modal = new FolderSuggestModal(this.app, choices, async (choice) => {
            this.plugin.settings.newFolder = choice;
            await this.plugin.saveSettings();
            this.display();
            modal.close();
          });
          modal.open();
        })
      );
  }
}
