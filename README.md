# Obsidian Media Subtitle Plugin

A powerful Obsidian plugin that enhances your video viewing experience by providing synchronized subtitles and customizable interface.

## Features

- 🎬 **Integrated Video Player**: Seamlessly watch videos directly within Obsidian
- 📝 **Subtitle Support**: Display and synchronize subtitles with video playback
- 🖱️ **Resizable Interface**: Drag the split bar to adjust the size of video and subtitle sections
- 🎯 **Auto-detection**: Automatically detects and loads video files specified in Markdown frontmatter
- 📱 **Responsive Design**: Adapts to different screen sizes for optimal viewing experience

## Installation

1. Download the latest release from the [GitHub repository](https://github.com/yourusername/obsidian-sample-plugin/releases)
2. Extract the zip file into your Obsidian plugins folder
3. Enable the plugin in Obsidian's settings

## Usage

### Basic Usage

1. Create a new Markdown file in your vault
2. Add a YAML frontmatter section at the beginning of the file with the video path:

```yaml
---
video: path/to/your/video.mp4
---
```

3. Below the frontmatter, add your subtitle content in the following format (each subtitle block separated by two newlines):

```
00:00 --> 00:05
This is the sample subtitle
```

4. Save the file and open it in Obsidian
5. The plugin will automatically detect the video file and subtitles, and open a video player view

### Adjusting Interface

- **Resize Sections**: Click and drag the split bar between the video and subtitle sections to adjust their sizes
- **Video Controls**: Use the standard video player controls to play, pause, seek, and adjust volume
- **Subtitle Navigation**: The current subtitle will be highlighted and automatically scrolled into view

## License

[Apache 2.0](LICENSE)