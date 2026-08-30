import type { JournalInteraction, JournalInsightsSynthesis } from '../types';

/**
 * Initiates a secure in-browser download of text content as a file.
 * Completely local with zero external network transmission.
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes a title for use in a file name.
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'reflection';
}

/**
 * Formats a single interaction into rich, Obsidian-compatible Markdown with YAML frontmatter.
 */
export function formatInteractionToMarkdown(item: JournalInteraction): string {
  const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
  const timeStr = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let md = `---
title: "${item.title.replace(/"/g, '\\"')}"
date: "${dateStr} ${timeStr}"
id: "${item.id}"
tags: [${(item.tags || []).map((t) => `"${t.replace(/"/g, '')}"`).join(', ')}]
${item.location ? `location: "${item.location.label || ''} (${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)})"` : ''}
---

# ${item.title}

*Reflected on ${dateStr} at ${timeStr}*

`;

  if (item.summary) {
    md += `## 📝 Summary\n> ${item.summary}\n\n`;
  }

  if (item.location) {
    const latDir = item.location.latitude >= 0 ? 'N' : 'S';
    const lngDir = item.location.longitude >= 0 ? 'E' : 'W';
    const coordStr = `${Math.abs(item.location.latitude).toFixed(4)}° ${latDir}, ${Math.abs(item.location.longitude).toFixed(4)}° ${lngDir}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${item.location.latitude},${item.location.longitude}`;
    
    md += `## 📍 Location Context\n`;
    if (item.location.label) {
      md += `- **Place:** ${item.location.label}\n`;
    }
    md += `- **Coordinates:** ${coordStr} ([View on Google Maps](${mapsLink}))\n\n`;
  }

  if (item.reflectionCompass) {
    const c = item.reflectionCompass;
    md += `## 🧭 Reflection Compass\n\n`;
    md += `| Facet | Reflection Insight |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **What Happened** | ${c.whatHappened} |\n`;
    md += `| **What I'm Feeling** | ${c.whatImFeeling} |\n`;
    md += `| **What's Bothering Me** | ${c.whatsBotheringMe} |\n`;
    md += `| **What I Want** | ${c.whatIWant} |\n`;
    md += `| **What I Can Control** | ${c.whatICanControl} |\n`;
    md += `| **Next Step** | ${c.nextStep} |\n\n`;
  }

  if (item.reflectionPrompt) {
    md += `## 💡 Follow-up Question\n*${item.reflectionPrompt}*\n\n`;
  }

  md += `## 💬 Conversation Transcript\n\n`;
  for (const msg of item.messages || []) {
    const msgTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (msg.role === 'user') {
      md += `### 👤 You (${msgTime})\n\n${msg.text}\n\n`;
    } else {
      md += `### ✨ Gemini Thinking Companion (${msgTime})\n\n${msg.text}\n\n`;
    }
  }

  md += `\n---\n*Generated locally from Personal Gemini Journal*\n`;
  return md;
}

/**
 * Downloads a single reflection as a Markdown file.
 */
export function exportSingleInteractionAsMarkdown(item: JournalInteraction): void {
  const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
  const filename = `${dateStr}-${sanitizeFilename(item.title)}.md`;
  const markdown = formatInteractionToMarkdown(item);
  downloadFile(filename, markdown, 'text/markdown;charset=utf-8');
}

/**
 * Downloads all user interactions compiled into a unified Markdown master journal archive.
 */
export function exportAllInteractionsAsMarkdownArchive(
  items: JournalInteraction[], 
  userEmail?: string | null
): void {
  const exportDate = new Date().toISOString().split('T')[0];
  let md = `# Personal Gemini Journal Archive

**Export Date:** ${exportDate}  
**User:** ${userEmail || 'Private User'}  
**Total Reflections:** ${items.length}  

---

## Table of Contents

`;

  // Sort chronologically (newest first)
  const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);

  sorted.forEach((item, idx) => {
    const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
    const tags = item.tags && item.tags.length > 0 ? ` *(${item.tags.join(', ')})*` : '';
    md += `${idx + 1}. [${item.title} (${dateStr})](#entry-${idx + 1}) ${tags}\n`;
  });

  md += `\n\n---\n\n`;

  sorted.forEach((item, idx) => {
    md += `<a name="entry-${idx + 1}"></a>\n\n`;
    md += formatInteractionToMarkdown(item);
    md += `\n\n---\n\n`;
  });

  const filename = `gemini-journal-archive-${exportDate}.md`;
  downloadFile(filename, md, 'text/markdown;charset=utf-8');
}

/**
 * Downloads all user interactions as a structured JSON backup.
 */
export function exportAllInteractionsAsJson(
  items: JournalInteraction[], 
  userEmail?: string | null
): void {
  const exportDate = new Date().toISOString().split('T')[0];
  const payload = {
    app: 'Personal Gemini Journal',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userEmail: userEmail || 'Private User',
    totalEntries: items.length,
    interactions: items,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const filename = `gemini-journal-backup-${exportDate}.json`;
  downloadFile(filename, jsonStr, 'application/json;charset=utf-8');
}

/**
 * Downloads an AI Longitudinal Insights Synthesis report as a Markdown document.
 */
export function exportInsightsSynthesisAsMarkdown(synthesis: JournalInsightsSynthesis): void {
  const exportDate = new Date().toISOString().split('T')[0];
  let md = `---
title: "Journal Theme & Growth Synthesis"
date: "${synthesis.generatedAt}"
timeframe: "${synthesis.timeframe}"
reflections_analyzed: ${synthesis.totalReflectionsAnalyzed}
---

# 🧠 Journal Theme & Growth Synthesis

*Generated on ${new Date(synthesis.generatedAt).toLocaleDateString()} for timeframe: **${synthesis.timeframe}***  
*Based on ${synthesis.totalReflectionsAnalyzed} private reflection sessions.*

> **Privacy & Integrity Notice:** This synthesis is an AI reflection derived from your private journal entries. It is intended for constructive self-reflection, not automated decisions.

---

## 🌟 Mindset & Cognitive Landscape
${synthesis.mindsetSummary}

---

## 🔍 Core Themes & Patterns
`;

  for (const theme of synthesis.coreThemes) {
    md += `### • ${theme.theme}\n${theme.description}\n\n`;
  }

  md += `## 🌱 Agency & Growth Indicators\n`;
  for (const indicator of synthesis.growthIndicators) {
    md += `- ${indicator}\n`;
  }

  md += `\n## ❓ Ongoing Inquiries & Curiosities\n`;
  for (const inquiry of synthesis.ongoingInquiries) {
    md += `- ${inquiry}\n`;
  }

  md += `\n## 💡 Forward-Looking Reflection Prompt\n> *${synthesis.suggestedForwardPrompt}*\n\n`;

  md += `---\n*Exported from Personal Gemini Journal*\n`;

  const filename = `journal-synthesis-${exportDate}.md`;
  downloadFile(filename, md, 'text/markdown;charset=utf-8');
}
