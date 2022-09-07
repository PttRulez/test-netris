import { useEffect, useRef, useState } from 'react';
import { timestamps as initData } from './data'

function App() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D>(null);
  const [timestamps, setTimestamps] = useState([]);

  const play = () => {
    video.current.paused ? video.current.play() : video.current.pause();
  };

  const convertTimestamp: (number) => string  = (timestamp) => {
    const minutes = String(Math.floor(timestamp / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((timestamp % 60000) / 1000)).padStart(2, '0');
    const miliseconds = timestamp % 1000;
    return `${minutes}:${seconds}:${miliseconds}`;
  };

  const spanClick: (number) => void = timestamp => {
    video.current.currentTime = timestamp.timestamp / 1000;
  };

  useEffect(() => {
    const converted = initData
      .map(t => {
        t.timeStr = convertTimestamp(t.timestamp);
        t.endTime = t.timestamp + t.duration;
        return t;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    setTimestamps(converted);
  }, []);

  useEffect(() => {
    video.current.onloadedmetadata = e => {
      canvas.current.width = video.current.clientWidth;
      canvas.current.height = video.current.clientHeight - 70;

      context.current = canvas.current.getContext('2d');
      context.current.fillStyle = 'rgba(0, 200, 0)';
    };
  }, []);

  useEffect(() => {
    if (timestamps.length > 0) {
      timestamps.forEach(timestamp => {
        function draw(e) {
          const stamp = Math.round(video.current.currentTime * 1000);
          if (stamp > timestamp.timestamp && stamp < timestamp.endTime) {
            console.log('draw', timestamp.timestamp);

            context.current.fillRect(
              timestamp.zone.left,
              timestamp.zone.top,
              timestamp.zone.width,
              timestamp.zone.height
            );
            video.current.removeEventListener('timeupdate', draw);
            video.current.addEventListener('timeupdate', clear);
          }
        }

        function clear(e) {
          if (Math.round(video.current.currentTime * 1000) > timestamp.endTime) {
            console.log('draw', timestamp.timestamp);
            context.current.clearRect(
              timestamp.zone.left,
              timestamp.zone.top,
              timestamp.zone.width,
              timestamp.zone.height
            );
            video.current.removeEventListener('timeupdate', clear);
            video.current.addEventListener('timeupdate', draw);
          }
        }

        video.current.addEventListener('timeupdate', draw);
      });
    }
  }, [timestamps]);

  return (
    <div className='app'>
      <div className='timestamps'>
        {timestamps.map(t => {
          return (
            <span key={t.id} onClick={() => spanClick(t)}>
              {t.timeStr}
            </span>
          );
        })}
      </div>
      <div className='video-wrapper'>
        <canvas ref={canvas} onClick={play}></canvas>
        <video ref={video} id='videoDiv' controls>
          <source
            src='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            type='video/mp4'
          />
        </video>
      </div>
    </div>
  );
}

export default App;
