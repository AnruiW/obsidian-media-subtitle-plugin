import { App, Plugin, TFile, ItemView, WorkspaceLeaf, parseYaml } from "obsidian";
import { VideoSubtitleView } from "./src/videoview";

const VIEW_TYPE_VIDEO = "video-subtitle-view";

export default class VideoSubtitlePlugin extends Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_VIDEO,
      (leaf) => new VideoSubtitleView(leaf)
    );

    // 监听文件打开事件
    this.registerEvent(
      this.app.workspace.on("file-open", async (file) => {
        if (file) await this.handleFileOpen(file);
      })
    );
  }

  async handleFileOpen(file: TFile) {
    if (file.extension !== "md") return;
    console.log(`the file name is ${file.name}, path is ${file.path}`)

    const content = await this.app.vault.read(file);

    // 检查是否包含 #video_subtitle
    if (!content.startsWith("---\nvideo:")) {
      console.log("the file is not video")
      return ;
    } else {
      console.log("the file is video");
    }
    

    // 解析 frontmatter（YAML 在开头 --- 中）
    let videoPath = "";
    let rawSubtitle = "";
    if (content.startsWith("---")) {
      const fmEnd = content.indexOf("---", 3);
      if (fmEnd > 0) {
        const fmRaw = content.substring(3, fmEnd).trim();
        rawSubtitle = content.substring(fmEnd + 3).trim();

        try {
          const fm = parseYaml(fmRaw);
          console.log(fm);
          videoPath = fm.video || "";
        } catch (e) {
          console.error("YAML parse error:", e);
        }
      }
    } else {
      console.log("it doesn't start with ---");
    }

    if (videoPath) {
      const leaf = this.app.workspace.getLeaf(true);
      await leaf.setViewState({
        type: VIEW_TYPE_VIDEO,
        active: true,
        state: { videoPath: videoPath, fileName: file.name, rawSubtitle: rawSubtitle },
      });
    }
  }
}


function parseTime(t: string): number {
  const [h, m, s] = t.split(":");
  const [sec, ms] = s.split(",");
  return (
    parseInt(h) * 3600 +
    parseInt(m) * 60 +
    parseInt(sec) +
    parseInt(ms) / 1000
  );
}