import React, { useState, useRef, useEffect } from 'react';
import { Subtitle } from "src/subtitle";
import { Play, Pause } from 'lucide-react';


interface SubtitleMap {
  startTime: string;
  endTime: string;
  content: string;
}

export function VideoPlayer({
	videoPath,
	fileName,
	rawSubtitle,
}: {
	videoPath: string;
	fileName: string;
	rawSubtitle: string[];
}) {

	// for video playing time
	const [currentTime, setCurrentTime] = useState<number>(0);

	// for video playing control
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	// for section height adjust
	const dragStartY = useRef<number>(0);
	const initialTopHeight = useRef<number>(0);
	const [topHeight, setTopHeight] = useState<number>(300);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const containerRef = useRef<HTMLDivElement>(null);
	
	// for subtitle content reload
	const [subtitles, setSubtitles] = useState<Map<string, string>[]>([]);


	// 解析字幕数据
	useEffect(() => {
		if (!rawSubtitle || rawSubtitle.length === 0) return;
		
		const parsedSubtitles: Map<string, string>[] = [];
		rawSubtitle.forEach((item: string) => {
			try {
				const parts = item.split(" --> ");
				if (parts.length < 2) return;
								
				const startTime = parts[0].trim();
				const endAndContent = parts[1].split("\n");
				const endTime = endAndContent[0]?.trim() || '';
				const content = endAndContent.slice(1).join('\n').trim() || '';
								
				if (startTime && endTime && content) {
					let tem_map = new Map<string, string>()
					tem_map.set("startTime", startTime)
					tem_map.set("endTime", endTime)
					tem_map.set("content", content)
					parsedSubtitles.push(tem_map);
				}
			} catch (error) {
				console.error('解析字幕出错:', error);
			}
		});
		
		setSubtitles(parsedSubtitles);
	}, [rawSubtitle]);

	const togglePlayPause = () => {
		if (!videoRef.current) return;

		if (isPlaying) {
			videoRef.current?.pause();
		} else {
			videoRef.current?.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);
		}
	};

	// const handelVideoMetaData = () => {
	// 	if (videoRef.current) {
	// 		videoRef.current.addEventListener('loadedmetadata', () => {
	// 			setDuration(videoRef.current?.duration || 0);
	// 		});
	// 	}
	// }

	// 分割条拖动开始事件
	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		dragStartY.current = e.clientY;
		initialTopHeight.current = topHeight;
		// 设置鼠标样式
		document.body.style.cursor = 'ns-resize';
		// 防止鼠标移动时选中文本
		e.preventDefault();
	};

	// 分割条拖动过程事件
	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging || !containerRef.current) return;

		const deltaY = e.clientY - dragStartY.current;
		const newTopHeight = initialTopHeight.current + deltaY;

		// 限制最小和最大高度，例如最小50px，最大容器高度-50px-分隔条高度
		const containerHeight = containerRef.current.clientHeight;
		const minHeight = 50;
		const maxHeight = containerHeight - 50 - 10; // 10是分隔条高度

		if (newTopHeight >= minHeight && newTopHeight <= maxHeight) {
		setTopHeight(newTopHeight);
		}
	};

	// 分割条拖动结束事件
	const handleMouseUp = () => {
		setIsDragging(false);
		// 确保光标样式重置
		document.body.style.cursor = '';
	};

	// 添加和清理全局事件监听器
	useEffect(() => {
		if (isDragging) {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		} else {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		}

		// 清理函数
		return () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging]);

	return (
		<div 
			className="app-container" 
			ref={containerRef}
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh', // 使用视口高度确保容器有明确的尺寸
				width: '100%',
				boxSizing: 'border-box'
			}}
		>
			<div
				className="video-section"
				style={{
					height: `${topHeight}px`,
					backgroundColor: "#000", // 黑色背景更适合视频播放
					padding: "5px",
					overflow: "hidden", // 防止视频超出容器
					display: 'flex',
					flexDirection: 'column',
					position: 'relative'
				}}
			>
				<video
					className="video-player"
					width="100%"
					height="100%"
					src={this.app.vault.adapter.getResourcePath(videoPath)}
					ref={videoRef}
					onTimeUpdate={handleTimeUpdate}
					onClick={togglePlayPause}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					style={{ position: 'relative', top: 0, left: 0 }}
				/>
				<div 
					className="video-controls"
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
						display: 'flex',
						alignItems: 'center',
						gap: '12px'
					}}
				>
					<button
						className="video-play-control"
						onClick={togglePlayPause}
					>
						{isPlaying ? <Pause/> : <Play/>}
					</button>
				</div>
			</div>
			<div 
				className="split-bar"
				onMouseDown={handleMouseDown}
				style={{
					height: "6px",
					backgroundColor: "transparent",
					cursor: "ns-resize",
					flexShrink: 0,
					position: "relative",
					transition: "background-color 0.2s ease",
					userSelect: 'none'
				}}
				title="拖动调整大小"
			>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "60px",
						height: "2px",
						backgroundColor: isDragging ? "#444" : "#999",
						borderRadius: "1px",
						transition: "background-color 0.2s ease"
					}}
				></div>
			</div>
			<div
				className="subtitle-section"
				style={{
					height: `calc(100% - ${topHeight}px - 6px)`,
					backgroundColor: "#222831",
					padding: "12px",
					overflow: "auto",
					fontSize: '14px'
				}}
			>
				<Subtitle currentTime={currentTime * 1000} subtitles={subtitles} />
			</div>
		</div>
	);
}
