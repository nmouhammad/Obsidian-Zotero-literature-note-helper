import { Notice, Plugin } from "obsidian";
import { TopicMultiSelectModal } from "../modals/TopicMultiSelectModal";
import { getFullTopicName } from "../utils";
import { readFrontmatter, writeFrontmatter, getDisplayTopicsFromFrontmatter } from "../utils/frontmatter";


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
        // Read topics from YAML frontmatter property 'Topics'
        const frontmatter = await readFrontmatter(plugin.app, activeFile);
        const existingTopics = getDisplayTopicsFromFrontmatter(frontmatter);

        new TopicMultiSelectModal(plugin.app, topicTitles, async (selectedTopics) => {
          const activeFile = plugin.app.workspace.getActiveFile();
          if (!activeFile) {
            new Notice("❌ No active file.");
            return;
          }
          // Update Topics property in YAML frontmatter
          const newFrontmatter = await readFrontmatter(plugin.app, activeFile);
          newFrontmatter.Topics = selectedTopics.map(getFullTopicName);
          await writeFrontmatter(plugin.app, activeFile, newFrontmatter);
          new Notice("✅ Topics updated in properties.");
        }, existingTopics).open();
    }
});

}