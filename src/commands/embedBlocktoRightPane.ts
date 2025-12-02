import { MarkdownView, Notice, Plugin } from "obsidian";

// === Command 1: Embed the bullet point that the cursor is currently in (in the note on the left pane) to the note on the right pane ===

export function registerEmbedBlockToRightPane(plugin: Plugin) {
    plugin.addCommand({
          id: "embed-block-to-right-pane",
          name: "Embed block to right-hand note",
          callback: async () => {
            const workspace = plugin.app.workspace;
            const activeLeaf = workspace.activeLeaf;
    
            if (!activeLeaf) {
              new Notice("No active pane.");
              return;
            }
    
            const view = activeLeaf.view;
            if (!(view instanceof MarkdownView)) {
              new Notice("Active view is not a markdown editor.");
              return;
            }
    
            const sourceFile = view.file;
            if (!sourceFile) {
              new Notice("❌ Could not access source file.");
              return;
            }
    
            const sourceEditor = view.editor;
            const cursor = sourceEditor.getCursor();
            const currentLine = sourceEditor.getLine(cursor.line);
    
            const blockIdMatch = currentLine.match(/\^([a-zA-Z0-9-]+)$/);
            if (!blockIdMatch) {
              new Notice("No block ID found.");
              return;
            }
    
            const blockId = blockIdMatch[1];
            const embedLink = `![[${sourceFile.basename}#^${blockId}]]`;
    
            const leaves = workspace.getLeavesOfType("markdown");
            const activeRect = view.containerEl.getBoundingClientRect();
            let rightHandLeaf = null;
            let minDistance = Infinity;
    
            for (const leaf of leaves) {
              if (leaf === activeLeaf) continue;
              const otherView = leaf.view;
              if (!(otherView instanceof MarkdownView)) continue;
    
              const rect = otherView.containerEl.getBoundingClientRect();
              const distance = rect.left - activeRect.left;
              if (distance > 5 && distance < minDistance) {
                minDistance = distance;
                rightHandLeaf = leaf;
              }
            }
    
            if (!rightHandLeaf) {
              new Notice("❌ No right-hand note found.");
              return;
            }
    
            const targetView = rightHandLeaf.view as MarkdownView;
            const targetFile = targetView.file;
            if (!targetFile) {
              new Notice("❌ Could not access target file.");
              return;
            }
    
            const [targetContent, sourceContent] = await Promise.all([
              plugin.app.vault.read(targetFile),
              plugin.app.vault.read(sourceFile),
            ]);
    
            const targetLines = targetContent.split("\n");
            const heading = `### ${sourceFile.basename} [[${sourceFile.basename}|📑]]`;
            let headingIndex = targetLines.findIndex((line) => line.trim() === heading);
    
            if (headingIndex === -1) {
              targetLines.push("", heading);
              headingIndex = targetLines.length - 1;
            }
    
            let insertIndex = headingIndex + 1;
            while (insertIndex < targetLines.length && !targetLines[insertIndex].startsWith("#")) {
              insertIndex++;
            }
    
            targetLines.splice(insertIndex, 0, embedLink);
    
            const sourceLines = sourceContent.split("\n");
            const lineIndex = sourceLines.findIndex((line) => line.includes(`^${blockId}`));
            if (lineIndex !== -1) {
              sourceLines[lineIndex] = sourceLines[lineIndex].replace("- [/]", "- [n]");
            }
    
            await Promise.all([
              plugin.app.vault.modify(targetFile, targetLines.join("\n")),
              plugin.app.vault.modify(sourceFile, sourceLines.join("\n")),
            ]);
    
            new Notice(`✅ Embed added and bullet updated.`);
          },
        });
}