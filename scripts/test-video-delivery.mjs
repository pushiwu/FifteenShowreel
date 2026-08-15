import assert from "node:assert/strict";
import test from "node:test";

import {
  getHlsUrl,
  getVideoDeliveryConfig,
  getVideoSlug,
  supportsNativeHls,
} from "../src/utils/videoDelivery.js";

test("video delivery stays on MP4 when R2 base URL is absent", () => {
  assert.deepEqual(getVideoDeliveryConfig(""), { baseUrl: "", enabled: false });
  assert.equal(getHlsUrl("/projects/web-video/nian-nian/segment-01.mp4", ""), "");
});

test("HLS URL uses a stable project slug independent of the current segment", () => {
  assert.equal(getVideoSlug("/projects/web-video/nian-nian/segment-01.mp4"), "nian-nian");
  assert.equal(getVideoSlug("/projects/a-death.mp4"), "a-death");
  assert.equal(
    getHlsUrl("/projects/web-video/nian-nian/segment-01.mp4", "https://media.example.com/"),
    "https://media.example.com/hls/nian-nian/master.m3u8",
  );
});

test("native HLS capability is detected without assuming Safari", () => {
  assert.equal(supportsNativeHls({ canPlayType: () => "probably" }), true);
  assert.equal(supportsNativeHls({ canPlayType: () => "" }), false);
  assert.equal(supportsNativeHls(null), false);
});
