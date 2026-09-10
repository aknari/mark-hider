declare interface HTMLElement {
    empty(): void;
    setText(value: string): void;
    createEl(tag: string, options?: { text?: string }): HTMLElement;
    addClass(...classes: string[]): void;
    style: { cursor: string };
    setAttribute(name: string, value: string): void;
    addEventListener(type: string, listener: (event: MouseEvent) => unknown): void;
    classList: { add(tokens: string): void; remove(tokens: string): void; toggle(tokens: string, force?: boolean): void; };
}

declare module "obsidian" {
  export class App { workspace: Workspace; }
  export class Workspace { getLeavesOfType(type: string): Leaf[]; }
  export class Leaf { view: MarkdownView; }
  export class MarkdownView { editor: Editor; }
  export class Editor { cm: import("@codemirror/view").EditorView; }
  export class Plugin {
    app: App;
    addCommand(command: { id: string; name: string; callback: () => void }): void;
    addSettingTab(tab: PluginSettingTab): void;
    addStatusBarItem(): HTMLElement;
    registerEditorExtension(extension: unknown): void;
    loadData(): Promise<unknown>;
    saveData(data: unknown): Promise<void>;
  }
  export class PluginSettingTab { constructor(app: App, plugin: Plugin); containerEl: HTMLElement; }
  export class Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): this;
    setDesc(desc: string): this;
    addToggle(callback: (component: ToggleComponent) => unknown): this;
    addText(callback: (component: TextComponent) => unknown): this;
    addDropdown(callback: (component: DropdownComponent) => unknown): this;
    addButton(callback: (component: ButtonComponent) => unknown): this;
  }
  export class ToggleComponent { setValue(value: boolean): this; onChange(callback: (value: boolean) => void | Promise<void>): this; }
  export class TextComponent { setValue(value: string): this; setPlaceholder(text: string): this; onChange(callback: (value: string) => void | Promise<void>): this; }
  export class DropdownComponent { addOption(value: string, display: string): this; setValue(value: string): this; onChange(callback: (value: string) => void | Promise<void>): this; }
  export class ButtonComponent { setButtonText(text: string): this; setIcon(icon: string): this; setCta(): this; setTooltip(tooltip: string): this; onClick(callback: () => void | Promise<void>): this; }
  export function setIcon(parent: HTMLElement, iconId: string): void;
}

declare const document: { body: { classList: { add(tokens: string): void; remove(tokens: string): void; toggle(tokens: string, force?: boolean): void; } } };