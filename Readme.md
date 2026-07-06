# Academic note-taking helper

This plugin provides three helper commands for working with literature notes in Obsidian.

## Commands

- "Create point note from block"
    - Open a literature note, click on one highlight (or another line containing a block-ID in the end) and then use this command to create a new point note
	- while creating the point note you have the option to take the topics of the literature note with you

- "Embed block to right-hand note"
    - this is used to add additional highlights to an existing point note
    - open your literature note in the left pane and the existing point note in the right pane, then in the literature note click on the highlight you want to include in the point note, use this command to have it inserted there

- "Manage Topics"
	- Description: Opens a multi-select modal of available Topic notes (files whose basename ends with ` - Topic`) and lets you add or remove topic links in the active note. It pre-selects topics already present in the note.
	- Effect: Adds links to the chosen topic notes in the `Topics` property of the active note

## Features

- Create point notes from a highlight in a literature note seamlessly
- add highlights from a literature note to an existing point note
- Manage Topics via a multi-select UI for quick add/remove of topic links.

## Installation (Local Use)

1. Place the plugin folder inside your vault’s `.obsidian/plugins/` directory.
2. In Obsidian, go to **Settings → Community Plugins**.
3. Disable **Safe Mode** if it's on.
4. Click **"Reload plugins"**.
5. Enable **"Embed Bullet Plugin"**.

