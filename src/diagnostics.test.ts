import { describe, expect, it } from 'vitest';
import { createDiagnosticReport } from './diagnostics';

describe('diagnostic report', () => {
  it('contains capability states but excludes URLs, user agents, and error text', () => {
    const report = createDiagnosticReport(
      '0.1.0',
      {
        secureContext: true,
        online: true,
        localStorageAvailable: true,
        webRtcAvailable: true,
        canvasCaptureAvailable: true,
        videoFrameCallbackAvailable: true,
      },
      'local_connection_lost',
    );

    expect(report).toContain('"metaDat": "not-integrated"');
    expect(report).toContain('"glassesCameraPermission": "not-requested"');
    expect(report).toContain('"failure": "local_connection_lost"');
    expect(report).not.toContain('userAgent');
    expect(report).not.toContain('https://');
    expect(report).not.toContain('token');
  });
});
