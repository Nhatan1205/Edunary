import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { tokenService } from '../../utils/tokenService';

export const useHls = (videoId, videoRef) => {
    const hlsRef = useRef(null);
    
    const [qualityLevels, setQualityLevels] = useState([]);
    
    const [currentLevel, setCurrentLevel] = useState(-1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoId) return;

        const videoUrl = `/api/MediaFile/hls/${videoId}/master.m3u8`;
        
        const token = tokenService.getToken();
    
        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr, url) => {
                    if (token) {
                        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    }
                }
            });
            hlsRef.current = hls;
            hls.loadSource(videoUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const levels = data.levels.map((level) => ({
                    height: level.height,
                    bitrate: level.bitrate,
                }));
                setQualityLevels(levels);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if (hls.autoLevelEnabled || data.level === -1) {
                    setCurrentLevel(-1);
                } else {
                    setCurrentLevel(data.level);
                }
            });

            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                }
            };
        }
        // else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        //     video.src = videoUrl;
        //     video.addEventListener('loadedmetadata', () => {
        //         video.play();
        //     });
        // } 
    }, [videoId, videoRef]);

    const changeQuality = (levelIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = levelIndex; 
            setCurrentLevel(levelIndex);
        }
    };

    return {
        qualityLevels,
        currentLevel,
        changeQuality
    };
};