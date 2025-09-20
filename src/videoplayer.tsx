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
	children
}: {
	videoPath: string;
	fileName: string | never;
	rawSubtitle: string[];
	children?: React.ReactNode;
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
		>
			<div
				className="video-section"
				style={{height: `${topHeight}px`}}
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
				/>
				<div className="video-controls">
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
				title="拖动调整大小"
			>
				<div className="the-split-bar-item"></div>
			</div>
			<div
				className="subtitle-section"
				style={{height: `calc(100% - ${topHeight}px - 6px)`}}
			>
				<Subtitle currentTime={currentTime * 1000} subtitles={subtitles} />
			</div>
		</div>
	);
}
