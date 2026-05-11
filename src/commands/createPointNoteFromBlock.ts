import { MarkdownView, Notice, Plugin } from "obsidian";
import { InputPromptModal } from "../modals/InputPromptModal";
import { TopicSelectorModal } from "../modals/TopicSelectorModal";
import { getFullTopicName } from "../utils";
import { readFrontmatter, writeFrontmatter, getDisplayTopicsFromFrontmatter } from "../utils/frontmatter";

// === Command: Create point note & embed the bullet point the cursor is currently at & offer to copy topics ===

export function registerPointNoteFromBlock(plugin: Plugin) {
    plugin.addCommand({
          id: "create-point-note-from-block",
          name: "Create point note from block",
          callback: async () => {
            const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
            if (!view) {
              new Notice("Active view is not a markdown editor.");
              return;
            }
    
            const sourceFile = view.file;
            if (!sourceFile) {
              new Notice("❌ Could not access source file.");
              return;
            }
    
            const editor = view.editor;
            const cursor = editor.getCursor();
            const currentLine = editor.getLine(cursor.line);
    
            const blockIdMatch = currentLine.match(/\^([a-zA-Z0-9-]+)$/);
            if (!blockIdMatch) {
              new Notice("No block ID found on the current line.");
              return;
            }
    
            const blockId = blockIdMatch[1];
            const embedLink = `![[${sourceFile.basename}#^${blockId}]]`;
            const heading = `### ${sourceFile.basename} [[${sourceFile.basename}|📑]]`;
            const newFolder = (plugin as any).settings?.newFolder || "Point notes";

            // Read topics from YAML frontmatter property 'Topics'
            const frontmatter = await readFrontmatter(plugin.app, sourceFile);
            const topics = getDisplayTopicsFromFrontmatter(frontmatter);

            new InputPromptModal(plugin.app, async (newFileName: string) => {
            const allTopics = plugin.app.vault.getMarkdownFiles()
              .filter(f => f.basename.endsWith(" - Topic"))
              .map(f => f.basename);

            new TopicSelectorModal(plugin.app, allTopics, topics, async (selectedTopics: string[]) => {

                const newFilePath = `${newFolder}/${newFileName}.md`;

                // Check whether the folder exists in the vault (robust): normalize path, try adapter, fallback to file index
                const folderToCheck = (newFolder || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
                let folderExists = true;
                let warnedMissingFolder = false;
                if (folderToCheck) {
                  try {
                    const adapter = (plugin.app.vault.adapter as any);
                    if (adapter && typeof adapter.list === 'function') {
                      // adapter.list returns { files: [], folders: [] } on many adapters
                      try {
                        const res = await adapter.list(folderToCheck);
                        // If list returned, folder exists (even if empty)
                        if (res && (Array.isArray(res.folders) || Array.isArray(res.files) || typeof res === 'object')) {
                          folderExists = true;
                        } else {
                          folderExists = false;
                        }
                      } catch (e) {
                        // adapter.list may throw if path doesn't exist
                        folderExists = false;
                      }
                    } else if (adapter && typeof adapter.exists === 'function') {
                      folderExists = await adapter.exists(folderToCheck);
                    } else {
                      // fallback: check vault file index (case-insensitive compare on Windows)
                      const wanted = folderToCheck.toLowerCase();
                      folderExists = plugin.app.vault.getFiles().some((f) => {
                        const fp = f.path.replace(/\\/g, '/').toLowerCase();
                        return fp === wanted || fp.startsWith(wanted + '/');
                      });
                    }
                  } catch (e) {
                    folderExists = false;
                  }
                }

                if (!folderExists) {
                  new Notice(`⚠️ The configured folder "${newFolder}" does not appear to exist. Please double-check the settings of this plugin.`);
                  warnedMissingFolder = true;
                }
    
                // const yaml = selectedTopics.length
                //   ? `---\ntype: point-note\nTopics:\n${selectedTopics.map(t => `  - "${getFullTopicName(t)}"`).join("\n")}\n---\n\n`
                //   : `---\ntype: point-note\n---\n\n`;
    
    
                // Build YAML frontmatter object
                const newFrontmatter: any = {
                  type: "point-note"
                };
                if (selectedTopics.length) {
                  newFrontmatter.Topics = selectedTopics.map(getFullTopicName);
                }
                // Add creation date for better sorting and metadata (in format YYYY-MM-DD_HH-mm)
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                newFrontmatter.CreationDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
                // Compose note content
                const yamlString = `---\n${require("js-yaml").dump(newFrontmatter, { lineWidth: 1000 }).trim()}\n---\n\n`;
                try {
                                const newFileContent = `${yamlString}${heading}\n${embedLink}\n\n## Connected notes`;
                  await plugin.app.vault.create(newFilePath, newFileContent);
                  const newLeaf = plugin.app.workspace.getLeaf("split");
                  const newFileHandle = plugin.app.vault.getAbstractFileByPath(newFilePath);
                  if (newFileHandle) {
                    await newLeaf.openFile(newFileHandle);
                  }

                  const sourceContent = await plugin.app.vault.read(sourceFile);
                  const sourceLines = sourceContent.split("\n");
                  const lineIndex = sourceLines.findIndex((line: string) => line.includes(`^${blockId}`));
                  if (lineIndex !== -1) {
                    sourceLines[lineIndex] = sourceLines[lineIndex].replace("- [/]", "- [n]");
                    await plugin.app.vault.modify(sourceFile, sourceLines.join("\n"));
                  }

                  new Notice(`✅ Created point note at ${newFilePath} with block reference.`);
                } catch (e) {
                  if (!warnedMissingFolder) {
                    new Notice("❌ Failed to create note. Does it already exist?");
                  }
                }
              }).open();
            }).open();
          },
        });
}