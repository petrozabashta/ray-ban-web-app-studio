import { useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '@wearables-ui-toolkit/mrbd';
import { FullWidthButton } from './FullWidthButton';

type TestState = 'idle' | 'connecting' | 'streaming' | 'error';

interface LocalConnection {
  source: MediaStream;
  sender: RTCPeerConnection;
  receiver: RTCPeerConnection;
}

const MOCK_CAPTURE_FPS = 15;

function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  if (peer.iceGatheringState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      peer.removeEventListener('icegatheringstatechange', onStateChange);
      reject(new Error('Локальное соединение не завершило настройку.'));
    }, 5000);
    const onStateChange = () => {
      if (peer.iceGatheringState === 'complete') {
        window.clearTimeout(timeout);
        peer.removeEventListener('icegatheringstatechange', onStateChange);
        resolve();
      }
    };

    peer.addEventListener('icegatheringstatechange', onStateChange);
    onStateChange();
  });
}

export function MockStreamScreen({ onBack }: { onBack: () => void }) {
  const sourceCanvas = useRef<HTMLCanvasElement>(null);
  const receiverVideo = useRef<HTMLVideoElement>(null);
  const connection = useRef<LocalConnection | null>(null);
  const generation = useRef(0);
  const animationFrame = useRef<number | null>(null);
  const videoFrameCallback = useRef<number | null>(null);
  const cancelTrackWait = useRef<(() => void) | null>(null);
  const [state, setState] = useState<TestState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receivedFps, setReceivedFps] = useState(0);

  const release = useCallback(() => {
    generation.current += 1;
    cancelTrackWait.current?.();
    cancelTrackWait.current = null;
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    const active = connection.current;
    connection.current = null;
    if (active) {
      active.source.getTracks().forEach((track) => track.stop());
      active.sender.close();
      active.receiver.close();
    }

    const video = receiverVideo.current;
    if (video) {
      if (videoFrameCallback.current !== null) {
        video.cancelVideoFrameCallback(videoFrameCallback.current);
        videoFrameCallback.current = null;
      }
      video.pause();
      video.srcObject = null;
    }
  }, []);

  const stop = useCallback(() => {
    release();
    setReceivedFps(0);
    setErrorMessage('');
    setState('idle');
  }, [release]);

  useEffect(() => () => release(), [release]);

  const start = async () => {
    const canvas = sourceCanvas.current;
    const video = receiverVideo.current;
    if (!canvas || !video) {
      setState('error');
      setErrorMessage('Не удалось подготовить элементы локального теста.');
      return;
    }
    if (
      typeof RTCPeerConnection === 'undefined' ||
      typeof canvas.captureStream !== 'function' ||
      typeof video.requestVideoFrameCallback !== 'function'
    ) {
      setState('error');
      setErrorMessage('Браузер не поддерживает необходимые функции локального теста.');
      return;
    }

    stop();
    const run = generation.current;
    setState('connecting');

    let active: LocalConnection | null = null;
    try {
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Не удалось создать синтетический видеосигнал.');
      }

      const startedAt = performance.now();
      let frame = 0;
      const draw = () => {
        if (generation.current !== run) {
          return;
        }
        const elapsed = performance.now() - startedAt;
        const x = (elapsed / 5) % canvas.width;
        context.fillStyle = '#07131c';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#16a7c7';
        context.fillRect(x - 24, 72, 48, 48);
        context.fillStyle = '#f4f7f8';
        context.font = 'bold 18px system-ui';
        context.fillText('DEMO / MOCK', 12, 28);
        context.font = '14px system-ui';
        context.fillText(`Synthetic frame ${frame}`, 12, 52);
        frame += 1;
        animationFrame.current = window.requestAnimationFrame(draw);
      };
      draw();

      const source = canvas.captureStream(MOCK_CAPTURE_FPS);
      if (source.getVideoTracks().length === 0) {
        throw new Error('Браузер не создал видеодорожку для теста.');
      }

      const sender = new RTCPeerConnection({ iceServers: [] });
      let receiver: RTCPeerConnection;
      try {
        receiver = new RTCPeerConnection({ iceServers: [] });
      } catch (error) {
        sender.close();
        throw error;
      }
      active = { source, sender, receiver };
      connection.current = active;
      sender.addTrack(source.getVideoTracks()[0], source);

      const trackReady = new Promise<boolean>((resolve) => {
        let finished = false;
        const finish = (received: boolean) => {
          if (finished) {
            return;
          }
          finished = true;
          window.clearTimeout(timeout);
          receiver.removeEventListener('track', onTrack);
          if (cancelTrackWait.current === cancel) {
            cancelTrackWait.current = null;
          }
          resolve(received);
        };
        const onTrack = (event: RTCTrackEvent) => {
          if (event.track.kind !== 'video') {
            return;
          }
          video.srcObject = event.streams[0] ?? new MediaStream([event.track]);
          finish(true);
        };
        const cancel = () => finish(false);
        const timeout = window.setTimeout(cancel, 5000);
        cancelTrackWait.current = cancel;
        receiver.addEventListener('track', onTrack);
      });

      await sender.setLocalDescription(await sender.createOffer());
      await waitForIceGathering(sender);
      if (generation.current !== run || !sender.localDescription) {
        return;
      }
      await receiver.setRemoteDescription(sender.localDescription);
      await receiver.setLocalDescription(await receiver.createAnswer());
      await waitForIceGathering(receiver);
      if (generation.current !== run || !receiver.localDescription) {
        return;
      }
      await sender.setRemoteDescription(receiver.localDescription);
      if (!(await trackReady)) {
        throw new Error('Приёмник не получил тестовую видеодорожку.');
      }
      if (generation.current !== run) {
        return;
      }
      await video.play();

      const measurement = { startedAt: performance.now(), frames: 0 };
      const reportPresentedFrame: VideoFrameRequestCallback = (now) => {
        if (generation.current !== run) {
          return;
        }
        measurement.frames += 1;
        const duration = now - measurement.startedAt;
        if (duration >= 1000) {
          setReceivedFps(Math.round((measurement.frames * 1000) / duration));
          measurement.startedAt = now;
          measurement.frames = 0;
        }
        videoFrameCallback.current = video.requestVideoFrameCallback(reportPresentedFrame);
      };
      videoFrameCallback.current = video.requestVideoFrameCallback(reportPresentedFrame);
      setState('streaming');
    } catch (error) {
      if (generation.current !== run) {
        return;
      }
      release();
      setState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Локальный тест завершился с ошибкой.',
      );
    }
  };

  return (
    <Page headerText="Локальный видеотест" className="studio-page">
      <main className="screen-content mock-stream-screen" data-testid="mock-stream-screen">
        <p className="mock-warning" role="note">
          DEMO / MOCK: искусственный сигнал проходит через локальный WebRTC-канал в этой вкладке.
          Это не Meta DAT, не камера очков и не проверка передачи на дисплей очков.
        </p>

        <div className="mock-video-grid">
          <section aria-label="Синтетический источник">
            <h2>Источник · DEMO</h2>
            <canvas
              ref={sourceCanvas}
              className="mock-video"
              width={320}
              height={180}
              aria-label="Движущийся синтетический тестовый сигнал"
              role="img"
              data-testid="mock-source"
            />
          </section>
          <section aria-label="Локальный видеоприёмник">
            <h2>Приёмник · DEMO</h2>
            <video
              ref={receiverVideo}
              className="mock-video"
              aria-label="Видео, декодированное локальным тестовым приёмником"
              data-testid="mock-receiver"
              muted
              playsInline
            />
          </section>
        </div>

        <p role="status" data-testid="mock-stream-status">
          {state === 'idle' && 'Тест остановлен.'}
          {state === 'connecting' && 'Настраивается локальный видеоканал…'}
          {state === 'streaming' && 'DEMO: видеопоток отображается в локальном приёмнике.'}
          {state === 'error' && 'Локальный тест недоступен.'}
        </p>
        {state === 'error' && <p role="alert">{errorMessage}</p>}
        <p data-testid="mock-stream-metrics">
          Получатель показывает: {state === 'streaming' ? receivedFps : 0} кадров/с. Задержка
          end-to-end не измеряется.
        </p>
        <p>Камера и разрешения не запрашиваются. Видеоданные не сохраняются и не отправляются.</p>

        <div className="action-list">
          <FullWidthButton
            title="Запустить локальный тест DEMO/MOCK"
            onActivate={() => void start()}
            disabled={state === 'connecting' || state === 'streaming'}
          />
          <FullWidthButton
            title="Остановить локальный тест"
            onActivate={stop}
            disabled={state === 'idle'}
          />
          <FullWidthButton title="Назад на главный экран" onActivate={onBack} />
        </div>
      </main>
    </Page>
  );
}
