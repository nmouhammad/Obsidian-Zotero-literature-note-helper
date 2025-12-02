import { MarkdownView, Notice, Plugin } from "obsidian";
import { InputPromptModal } from "../modals/InputPromptModal";
import { TopicSelectorModal } from "../modals/TopicSelectorModal";
import { extractTopicsFromContent, getFullTopicName } from "../utils";

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

            const sourceContent = await plugin.app.vault.read(sourceFile);
            const topics = extractTopicsFromContent(sourceContent);

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
    
                const yaml = selectedTopics.length
                  ? `---\ntype: point-note\nTopics:\n${selectedTopics.map(t => `  - "${getFullTopicName(t)}"`).join("\n")}\n---\n\n`
                  : `---\ntype: point-note\n---\n\n`;
    
    
    
                const newFileContent = `${yaml}${heading}\n${embedLink}\n\n## Connected notes\n\n### Backlinking Notes not mentioned above\n\n\`\`\`dataviewjs\nconst { DataviewUtilsUnmentionedInlinks } = customJS;\nawait DataviewUtilsUnmentionedInlinks.prettyUnmentionedInlinks(dv);\n\`\`\``;
    
                try {
                  const newFile = await plugin.app.vault.create(newFilePath, newFileContent);
                  const newLeaf = plugin.app.workspace.getLeaf("split");
                  await newLeaf.openFile(newFile);
    
                  const sourceLines = sourceContent.split("\n");
                  const lineIndex = sourceLines.findIndex(line => line.includes(`^${blockId}`));
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