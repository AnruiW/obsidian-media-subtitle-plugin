import { App, Plugin, TFile, ItemView, WorkspaceLeaf, parseYaml } from "obsidian";
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { VideoPlayer } from 'src/videoplayer';

const VIEW_TYPE_VIDEO = "video-subtitle-view";

export class VideoSubtitleView extends ItemView {
  root: Root | null = null;
  videoPath: string = "";
  fileName: string = "";
  rawSubtitle: string = "";

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_VIDEO;
  }

  getDisplayText() {
    return "video";
  }

  async setState(state: any, result?: any) {

    this.videoPath = state.videoPath;
    this.fileName = state.fileName;
    this.rawSubtitle = state.rawSubtitle;
    console.log("the subtitle is coming!!!!!")
    console.log(state.rawSubtitle);
    await this.renderView(); 
    return super.setState(state, result);
  }

  async onOpen() {
    this.renderView();
  }

  async renderView() {
    this.root = createRoot(this.contentEl);

    this.root.render(
      <VideoPlayer videoPath={this.videoPath} fileName={this.app.vault.adapter.getResourcePath(this.fileName)} rawSubtitle={this.rawSubtitle.split("\n\n")}>
      </VideoPlayer>
		);

    // container.createEl('h2', { text: this.fileName });
    // const toolbar = container.createEl("div", { cls: "video-toolbar" });
    // const refreshBtn = toolbar.createEl("button", { text: "reload subtitle" });

    // refreshBtn.onclick = async () => {
    //   await this.reload();
    // };

    // const videoEl = container.createEl("video", {
    //   attr: { controls: "true", width: "100%" }
    // });

    // // 转换成 Obsidian 的本地资源 URL
    // videoEl.src = this.app.vault.adapter.getResourcePath(this.videoPath);
    // // videoEl.src = this.videoPath;

    // const subtitleEl = container.createEl("div", { cls: "subtitle-area" });

    // if (this.subtitlePath) {
    //   const file = this.app.vault.getAbstractFileByPath(this.subtitlePath);
    // } else {
    //   subtitleEl.setText("未找到字幕文件");
    // }
  }

  async reload() {
    // 取当前激活的笔记，重新解析 frontmatter
    const file = this.app.workspace.getActiveFile();
    if (file && file.extension === "md") {
      const content = await this.app.vault.read(file);
      if (content.startsWith("---")) {
        const fmEnd = content.indexOf("---", 3);
        if (fmEnd > 0) {
          const fmRaw = content.substring(3, fmEnd).trim();
          try {
            const fm = parseYaml(fmRaw);
            this.videoPath = fm.video || "";
          } catch (e) {
            console.error("YAML parse error:", e);
          }
        }
      }
    }

    // 重新渲染
    await this.renderView();
  }

  async onClose() {}
}