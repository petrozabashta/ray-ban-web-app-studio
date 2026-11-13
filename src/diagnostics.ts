export type DiagnosticFailure =
  | 'none'
  | 'unsupported_browser_api'
  | 'local_test_failed'
  | 'local_connection_lost';

export interface BrowserDiagnosticSnapshot {
  secureContext: boolean;
  online: boolean;
  localStorageAvailable: boolean;
  webRtcAvailable: boolean;
  canvasCaptureAvailable: boolean;
  videoFrameCallbackAvailable: boolean;
}

export function createDiagnosticReport(
  appVersion: string,
  browser: BrowserDiagnosticSnapshot,
  failure: DiagnosticFailure = 'none',
): string {
  return JSON.stringify(
    {
      format: 'ray-ban-web-app-studio-diagnostic-v1',
      appVersion,
      integration: {
        metaDat: 'not-integrated',
        glassesCameraPermission: 'not-requested',
        glassesConnection: 'not-checked',
        glassesDisplayOutput: 'not-implemented',
      },
      browser,
      failure,
    },
    null,
    2,
  );
}
