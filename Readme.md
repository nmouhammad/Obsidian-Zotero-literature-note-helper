# Embed Bullet Plugin

This plugin allows you to embed a selected bullet point (with a block ID) from the active note into the note to the right, under a collapsible heading named after the source note. It also updates the bullet symbol from `- [/]` to `- [n]` in the source note.

## Features

- Embed selected bullet (with block ID) into the right-hand note.
- Group embeds under `## [[sourceNoteName]]` heading.
- Automatically create the heading if it doesn't exist.
- Update the original bullet from `- [/]` to `- [n]`.

## Usage

1. Open two notes side by side in Obsidian.
2. Select a bullet point in the left note that ends with a block ID (e.g., `^abc123`).
3. Run the command: **"Embed selected bullet to right pane"** (via Command Palette or hotkey).
4. The embed will be inserted under `## [[sourceNoteName]]` in the right note.
5. The bullet in the source note will be updated from `- [/]` to `- [n]`.

## Installation (Local Use)

1. Place the plugin folder inside your vault’s `.obsidian/plugins/` directory.
2. In Obsidian, go to **Settings → Community Plugins**.
3. Disable **Safe Mode** if it's on.
4. Click **"Reload plugins"**.
5. Enable **"Embed Bullet Plugin"**.

This plugin is intended for local use and does not require publishing.
