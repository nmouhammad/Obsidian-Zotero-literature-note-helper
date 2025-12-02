import { Notice, Plugin } from "obsidian";
import { TopicMultiSelectModal } from "../modals/TopicMultiSelectModal";
import { extractTopicsFromContent, getFullTopicName } from "../utils";


// === Command 3: Help selecting topics in a literature note (search + add / remove) ===

export function registerManageTopics(plugin: Plugin) {
    plugin.addCommand({
      id: "manage-topics",
      name: "Manage Topics",
      callback: async () => {
        const topicTitles = plugin.app.vault.getMarkdownFiles()
          .filter(f => f.basename.endsWith(" - Topic"))
          .map(f => f.basename);

        const activeFile = plugin.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice("❌ No active file.");
            return;
        }
        if (!topicTitles.length) {
          new Notice("❌ No topics found. Create topics first.");
          return;
        }
        const content = await plugin.app.vault.read(activeFile);
        const existingTopics = extractTopicsFromContent(content);

        new TopicMultiSelectModal(plugin.app, topicTitles, async (selectedTopics) => {
          const activeFile = plugin.app.workspace.getActiveFile();
          if (!activeFile) {
            new Notice("❌ No active file.");
            return;
          }

          const content = await plugin.app.vault.read(activeFile);
          console.log("Selected topics:", selectedTopics);
          const topicLinks = selectedTopics.map(getFullTopicName).join(", ");

          const updated = content.replace(/- \*Topics\*::(.*)/, (match, p1) => {
            const newLinks = topicLinks;
            return `- *Topics*:: ${newLinks}`;
          });

          await plugin.app.vault.modify(activeFile, updated);
          new Notice("✅ Topics added.");
        },
        existingTopics
    ).open();
    }
});

}