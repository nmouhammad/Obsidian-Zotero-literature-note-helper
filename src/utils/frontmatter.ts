// Extract display name from a topic link like [[Topic - Topic|Display]]
export function extractTopicDisplayName(link: string): string {
  const match = link.match(/\[\[.*?\|(.*)\]\]/);
  return match ? match[1] : link;
}

// Get display names of topics from frontmatter.Topics
export function getDisplayTopicsFromFrontmatter(frontmatter: any): string[] {
  if (!Array.isArray(frontmatter.Topics)) return [];
  return frontmatter.Topics.map(extractTopicDisplayName);
}
// Utility for reading and writing YAML frontmatter using js-yaml
import { TFile, App } from "obsidian";
import yaml from "js-yaml";

/**
 * Reads the YAML frontmatter from a file and returns it as an object.
 */
export async function readFrontmatter(app: App, file: TFile): Promise<any> {
  const content = await app.vault.read(file);
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return yaml.load(match[1]) || {};
  } catch (e) {
    return {};
  }
}

/**
 * Writes the given frontmatter object back to the file, preserving the rest of the content.
 */
export async function writeFrontmatter(app: App, file: TFile, newFrontmatter: any) {
  const content = await app.vault.read(file);
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  const yamlString = yaml.dump(newFrontmatter, { lineWidth: 1000 }).trim();
  let newContent;
  if (match) {
    newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${yamlString}\n---`);
  } else {
    newContent = `---\n${yamlString}\n---\n` + content;
  }
  await app.vault.modify(file, newContent);
}
