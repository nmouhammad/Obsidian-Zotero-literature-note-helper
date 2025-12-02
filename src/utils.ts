export function extractTopicsFromContent(content: string): string[] {
  const match = content.match(/- \*Topics\*::(.*)/);
  if (!match) return [];

  const links = match[1].match(/\[\[(.*?)\]\]/g);
  if (!links) return [];

  // Extract only the Topicname part from each link
  return links.map(link => {
    // Remove [[ and ]]
    const inner = link.replace(/\[\[|\]\]/g, "").trim();
    // If there's a pipe, use the part after it; otherwise, strip " - Topic"
    if (inner.includes("|")) {
      return inner.split("|")[1];
    }
    return inner.replace(/ - Topic$/, "");
  });
}

export function formatTopicLink(topic: string): string {
  if (topic.includes("|")) {
    return topic.split("|")[1];
  }
  return topic.replace(/ - Topic$/, "");
}

export function getFullTopicName(input: string): string {
  console.log("getFullTopicName input:", input);
  const topic = input.replace(" - Topic", "").replace(/\[\[|\]\]/g, "").trim(); // just in case it's the full name
  console.log("getFullTopicName topic:", topic);
  return `[[${topic} - Topic|${topic}]]`;
}