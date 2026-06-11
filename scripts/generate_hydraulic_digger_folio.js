const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const workbookPath = path.join(root, "hydraulic_digger_portfolio_guided_viewer.html");

const exampleEvidence = {
  4: {
    image: "images/term3-hydraulic-digger/photo-examples/01_linkage_design_photo_examples.png",
    alt: "Example photos showing labelled sketch, pivot layout, syringe mounts, and bucket path"
  },
  7: {
    image: "images/term3-hydraulic-digger/photo-examples/02_assembly_evidence_photo_examples.png",
    alt: "Example photos showing base frame, boom and dipper, bucket linkage, and problem solving"
  },
  8: {
    image: "images/term3-hydraulic-digger/photo-examples/03_hydraulic_setup_photo_examples.png",
    alt: "Example photos showing filled syringe, tubing route, de-airing, and leak check"
  },
  9: {
    image: "images/term3-hydraulic-digger/photo-examples/04_test_method_photo_examples.png",
    alt: "Example photos showing reach setup, lift test, travel measurement, and safety zone"
  },
  10: {
    image: "images/term3-hydraulic-digger/photo-examples/05_results_and_data_photo_examples.png",
    alt: "Example photos showing data table, maximum lift, reach result, and MA/VR working"
  },
  11: {
    image: "images/term3-hydraulic-digger/photo-examples/06_tuning_and_redesign_photo_examples.png",
    alt: "Example photos showing failure point, adjustment, retest, and improvement sketch"
  }
};

const videoSlot = {
  key: "section-12-operation-video",
  title: "Operation Video Evidence",
  label: "Hydraulic digger operation video",
  guideImage: "images/term3-hydraulic-digger/photo-examples/07_operation_video_example.png",
  guideAlt: "Example storyboard showing full model in view, boom movement, dipper movement, and bucket movement for the operation video"
};

function ensureAssetsExist() {
  const assets = [
    ...Object.values(exampleEvidence).map((item) => item.image),
    videoSlot.guideImage
  ];
  const missing = assets.filter((asset) => !fs.existsSync(path.join(root, asset)));
  if (missing.length) {
    throw new Error(`Missing hydraulic digger photo guide assets:\n${missing.join("\n")}`);
  }
}

function replaceBlock(html, regex, replacement, label) {
  if (!regex.test(html)) {
    throw new Error(`Could not update ${label}; expected block was not found.`);
  }
  return html.replace(regex, replacement);
}

function ensureVideoGuideCss(html) {
  if (!html.includes(".video-guide-image img")) {
    html = html.replace(
      ".example-evidence img {",
      ".example-evidence img,\n    .video-guide-image img {"
    );
  }
  return html;
}

function updateWorkbook() {
  ensureAssetsExist();

  let html = fs.readFileSync(workbookPath, "utf8");

  html = html.replace(/images\/term3-hydraulic-digger\/photo-examples\/([^"]+?)\.jpg/g, "images/term3-hydraulic-digger/photo-examples/$1.png");

  html = replaceBlock(
    html,
    /const EXAMPLE_EVIDENCE = \{[\s\S]*?\};\s*\n\s*const VIDEO_SLOT/,
    `const EXAMPLE_EVIDENCE = ${JSON.stringify(exampleEvidence, null, 6)};\n    const VIDEO_SLOT`,
    "example evidence image mapping"
  );

  html = replaceBlock(
    html,
    /const VIDEO_SLOT = \{[\s\S]*?\};/,
    `const VIDEO_SLOT = ${JSON.stringify(videoSlot, null, 6)};`,
    "operation video guide mapping"
  );

  html = ensureVideoGuideCss(html);

  html = replaceBlock(
    html,
    /function renderVideoEvidence\(\) \{[\s\S]*?\n    \}\n\n    function getSession/,
    `function renderVideoEvidence() {
      return \`
        <div class="video-evidence" aria-label="Test video upload">
          <h4>\${VIDEO_SLOT.title}</h4>
          <p class="mini">Upload one short video of your hydraulic digger operating through boom, dipper and bucket movement. It will be included in the ZIP backup, not the smaller JSON-only download.</p>
          <div class="example-evidence-body video-guide-image">
            <p class="example-note">Use this guide to frame the model and show each required movement clearly.</p>
            <img src="\${VIDEO_SLOT.guideImage}" alt="\${VIDEO_SLOT.guideAlt}" loading="lazy" />
          </div>
          <div class="video-upload-panel">
            <div id="video-placeholder" class="video-placeholder">No test video uploaded yet</div>
            <video id="video-preview" class="video-preview" controls preload="metadata"></video>
            <div class="video-actions">
              <label class="video-upload" for="test-video-input">Choose Test Video</label>
              <button id="video-remove" class="video-remove" type="button">Clear Video</button>
              <span id="video-file-name" class="video-file-name"></span>
            </div>
            <input id="test-video-input" type="file" accept="video/*" hidden />
          </div>
        </div>
      \`;
    }

    function getSession`,
    "operation video evidence renderer"
  );

  fs.writeFileSync(workbookPath, html);
  console.log("Hydraulic digger folio photo examples updated.");
}

updateWorkbook();
