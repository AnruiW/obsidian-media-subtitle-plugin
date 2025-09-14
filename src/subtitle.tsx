import { useState, useEffect, useMemo, useRef } from "react";

class subtitleItem {
	startTime: number;
	endTime: number;
	content: string;
}

function parseTime(time: string | undefined) {
	if (time === undefined) {
		return 0;
	}
	const [minute, second] = time.split(":");
	return parseInt(minute) * 60 * 1000 + parseInt(second) * 1000;
}

export function Subtitle({currentTime, subtitles}: {currentTime: number, subtitles: Array<Map<string, string>>}) {
	const activeSubtitleRef = useRef<HTMLDivElement | null>(null);

	// Find current subtitle index based on the current time
	const currentSubtitleIndex = useMemo(() => {
		return subtitles.findIndex(
			(item) =>
				parseTime(item.get("startTime")) <= currentTime && parseTime(item.get("endTime")) >= currentTime
		);
	}, [currentTime, subtitles]);

	useEffect(() => {
		if (activeSubtitleRef.current && currentSubtitleIndex !== -1) {
			// Scroll to current subtile and set a delay for smoothness
			setTimeout(() => {
				activeSubtitleRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "nearest",
				});
			}, 100);
		}
	}, [currentSubtitleIndex]);

	const formatTime = (milliseconds: number) => {
		const second = Math.floor(milliseconds / 1000);
		const minute = Math.floor(second / 60);
		const remainingSeconds = second % 60;

		return `${minute}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const renderSentence = (words: string[]) => {
		return (
			<div className="subtitle-sentence">
				{words.map((word, index) => (
					<span key={index} className="subtitle-sentence-container">
						<span
							className="subtitle-sentence-word"
							// onDoubleClick={() => console.log("TODO.双击单词")}
						>
							{word}
							{index < words.length - 1 && ' '}
						</span>
					</span>
				))}
			</div>
		);
	};

	const renderSubtitleItem = (item: Map<string, string>, subtitleIndex: number) => {
		const isActive = currentSubtitleIndex === subtitleIndex;
		const isFinish = parseTime(item.get("endTime")) <= currentTime;
		const isFuture = parseTime(item.get("startTime")) > currentTime;

		const words = item.get("content")
			?.trim()
			.split(/\s+/)
			.filter((word) => word.length > 0) || [];

		return (
			<div
				ref={isActive ? activeSubtitleRef : null}
				key={subtitleIndex}
				className={`subtitle-item ${isActive ? "active" : ""} ${isFinish ? "past" : ""} ${isFuture ? "future" : ""}`}
			>
				<div 
					className="subtitle-item-status-info"
					style={{
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<span 
						className="time-info"
						style={{
							color: isActive ? '#00adb5' : 'white',
							fontSize: '16px',
							fontWeight: 'bold',
							marginLeft: '3px'
						}}
					>
						{`${item.get("startTime")} ⭢ ${item.get("endTime")}`}
					</span>
					{isActive && (
						<>
							<span 
								className="current-indicator" 
								style={{fontSize: '8px', marginLeft: '10px'}}
							>
								● Playing
							</span>
						</>
					)}
				</div>

				<div className="subtitle-content">{renderSentence(words)}</div>
			</div>
		);
	};

	return (
		<div className="subtitle-container">
			{subtitles.length === 0 ? (
				<div>
					<p>{`no subtitle now,\n you can add it in the note`}</p>
				</div>
			) : (
				subtitles.map((item, index) => renderSubtitleItem(item, index))
			)}
		</div>
	);
}
