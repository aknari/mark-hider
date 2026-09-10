import { App, Plugin, PluginSettingTab, Setting, setIcon } from "obsidian";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, StateEffect, StateField, Text } from "@codemirror/state";

type PatternMode = "contains" | "regex";

interface MarkerPattern {
  id: string;
  text: string;
  mode: PatternMode;
  enabled: boolean;
}

interface MarkHiderSettings {
  hideMarkers: boolean;
  hideObsidianComments: boolean;
  patterns: MarkerPattern[];
}

const DEFAULT_SETTINGS: MarkHiderSettings = {
  hideMarkers: true,
  hideObsidianComments: false,
  patterns: [
    { id: "example-tc", text: "task-consolidator", mode: "contains", enabled: true },
  ],
};

const BODY_CLASS = "mh-hidden";

const HTML_COMMENT_RE = /^\s*<!--\s*([\s\S]*?)\s*-->\s*$/;
const OBSIDIAN_COMMENT_RE = /^\s*%%\s*([\s\S]*?)\s*%%\s*$/;

/** Compiled from the enabled patterns; null means "hide nothing". */
let currentMatcher: ((inner: string) => boolean) | null = null;
let currentIncludeObsidian = false;

const markedLineDeco = Decoration.line({ class: "mh-marked" });
const obsidianLineDeco = Decoration.line({ class: "mh-marked-obsidian" });
const refreshEffect = StateEffect.define<null>();

function compileMatcher(patterns: MarkerPattern[]): ((inner: string) => boolean) | null {
  const compiled: Array<(inner: string) => boolean> = [];
  for (const pattern of patterns) {
    if (!pattern.enabled) continue;
    const text = pattern.text.trim();
    if (text === "") continue;
    if (pattern.mode === "contains") {
      if (text === "*") compiled.push(() => true);
      else compiled.push((inner) => inner.includes(text));
    } else {
      let re: RegExp | null = null;
      try { re = new RegExp(text); } catch { re = null; }
      if (re !== null) compiled.push((inner) => re!.test(inner));
    }
  }
  if (compiled.length === 0) return null;
  return (inner: string) => compiled.some((fn) => fn(inner));
}

function scanDoc(doc: Text): DecorationSet {
  if (currentMatcher === null && !currentIncludeObsidian) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  for (let pos = 1; pos <= doc.length; ) {
    const line = doc.lineAt(pos);
    // HTML comments: only when an enabled pattern matches the inner text.
    const html = HTML_COMMENT_RE.exec(line.text);
    if (html !== null && currentMatcher !== null && currentMatcher(html[1].trim())) {
      builder.add(line.from, line.from, markedLineDeco);
    } else if (currentIncludeObsidian && OBSIDIAN_COMMENT_RE.test(line.text)) {
      // Obsidian %% comments: all standalone ones, patterns do not apply.
      builder.add(line.from, line.from, obsidianLineDeco);
    }
    pos = line.to + 1;
  }
  return builder.finish();
}

const markerField = StateField.define<DecorationSet>({
  create(state) { return scanDoc(state.doc); },
  update(deco, tr) {
    if (!tr.docChanged && !tr.effects.some((e) => e.is(refreshEffect))) return deco;
    return scanDoc(tr.state.doc);
  },
  provide: (f) => EditorView.decorations.from(f),
});

export default class MarkHiderPlugin extends Plugin {
  settings: MarkHiderSettings = DEFAULT_SETTINGS;
  private statusBarItem: HTMLElement | null = null;

  async onload(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.recompileMatcher();
    this.registerEditorExtension(markerField);
    this.applyState();

    this.addCommand({
      id: "toggle-marker-hiding",
      name: "Toggle marker hiding",
      callback: () => void this.toggleHideMarkers(),
    });

    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass("mod-clickable", "mark-hider-status-item");
    this.statusBarItem.style.cursor = "pointer";
    this.statusBarItem.addEventListener("click", () => void this.toggleHideMarkers());
    this.renderStatusBar();

    this.addSettingTab(new MarkHiderSettingTab(this.app, this));
  }

  onunload(): void {
    currentMatcher = null;
    currentIncludeObsidian = false;
    document.body.classList.remove(BODY_CLASS);
  }

  async saveSettings(): Promise<void> { await this.saveData(this.settings); }

  /** Recompiles the matcher and forces every open editor to re-scan. */
  recompileMatcher(): void {
    currentMatcher = compileMatcher(this.settings.patterns);
    currentIncludeObsidian = this.settings.hideObsidianComments;
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view.editor?.cm) view.editor.cm.dispatch({ effects: [refreshEffect.of(null)] });
    }
  }

  applyState(): void {
    document.body.classList.toggle(BODY_CLASS, this.settings.hideMarkers);
  }

  /** Redraws the status-bar toggle to reflect the current state. */
  renderStatusBar(): void {
    if (this.statusBarItem === null) return;
    this.statusBarItem.empty();
    try {
      setIcon(this.statusBarItem, this.settings.hideMarkers ? "eye-off" : "eye");
    } catch {
      this.statusBarItem.setText(this.settings.hideMarkers ? "Marks: hidden" : "Marks: shown");
    }
    const label = this.settings.hideMarkers
      ? "Markers hidden — click to show"
      : "Markers shown — click to hide";
    this.statusBarItem.setAttribute("aria-label", label);
    this.statusBarItem.setAttribute("title", label);
  }

  private async toggleHideMarkers(): Promise<void> {
    this.settings.hideMarkers = !this.settings.hideMarkers;
    this.applyState();
    this.renderStatusBar();
    await this.saveSettings();
  }
}

class MarkHiderSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: MarkHiderPlugin) { super(app, plugin); }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mark Hider" });
    new Setting(containerEl)
      .setName("Hide marker comments in the editor")
      .setDesc(
        "Hides standalone comments (alone on a line) that match one of the patterns below, in Source mode and Live Preview. " +
        "Comments inside code blocks are never hidden. Lines whose marker is hidden keep a subtle ribbon as a location cue; " +
        "hover the line or place the caret on it to reveal the text. Markers are always hidden in Reading view by Obsidian itself."
      )
      .addToggle((toggle) => toggle.setValue(this.plugin.settings.hideMarkers).onChange(async (value) => {
        this.plugin.settings.hideMarkers = value;
        this.plugin.applyState();
        this.plugin.renderStatusBar();
        await this.plugin.saveSettings();
      }));
    new Setting(containerEl)
      .setName("Hide all Obsidian %% comments")
      .setDesc("Hides every Obsidian %% ... %% comment that is alone on a line, regardless of the patterns below. Patterns only govern HTML <!-- ... --> comments.")
      .addToggle((toggle) => toggle.setValue(this.plugin.settings.hideObsidianComments).onChange(async (value) => {
        this.plugin.settings.hideObsidianComments = value;
        this.plugin.recompileMatcher();
        await this.plugin.saveSettings();
      }));
    containerEl.createEl("h3", { text: "Marker patterns" });
    new Setting(containerEl)
      .setName("Patterns")
      .setDesc(
        "An HTML comment is hidden when its text (between <!-- and -->) matches an enabled pattern. " +
        "Contains = plain substring; Regex = JavaScript regular expression (invalid regexes are ignored). " +
        "A pattern of exactly * (Contains mode) matches everything. Empty or fully disabled list = nothing hidden. Matching is case-sensitive."
      )
      .addButton((button) => button.setButtonText("Add pattern").setCta().onClick(() => {
        this.plugin.settings.patterns.push({ id: newPatternId(), text: "", mode: "contains", enabled: true });
        void this.plugin.saveSettings();
        this.display();
      }));
    this.plugin.settings.patterns.forEach((pattern, index) => this.renderPatternRow(containerEl, pattern, index));
  }

  private renderPatternRow(containerEl: HTMLElement, pattern: MarkerPattern, index: number): void {
    const row = new Setting(containerEl);
    row.addToggle((toggle) => toggle.setValue(pattern.enabled).onChange(async (value) => {
      pattern.enabled = value;
      this.plugin.recompileMatcher();
      await this.plugin.saveSettings();
    }));
    row.addDropdown((dropdown) => dropdown
      .addOption("contains", "Contains")
      .addOption("regex", "Regex")
      .setValue(pattern.mode)
      .onChange(async (value) => {
        pattern.mode = value as PatternMode;
        this.plugin.recompileMatcher();
        await this.plugin.saveSettings();
      }));
    row.addText((text) => text
      .setValue(pattern.text)
      .setPlaceholder("e.g. task-consolidator")
      .onChange(async (value) => {
        pattern.text = value;
        this.plugin.recompileMatcher();
        await this.plugin.saveSettings();
      }));
    row.addButton((button) => button
      .setIcon("trash")
      .setTooltip("Remove pattern")
      .onClick(() => {
        this.plugin.settings.patterns.splice(index, 1);
        this.plugin.recompileMatcher();
        void this.plugin.saveSettings();
        this.display();
      }));
  }
}

function newPatternId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}