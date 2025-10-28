# 🚀 Phase 2 & 3 - Developer Quick Reference

## 📦 All New Utilities

### 1. Screenshot Capture
```typescript
import { ScreenshotCapture } from './utils/screenshot';

// Capture visible tab
const screenshot = await ScreenshotCapture.captureVisibleTab();
// { id, data: base64, timestamp, width, height }

// Capture element
const element = document.querySelector('.error-box');
const screenshot = await ScreenshotCapture.captureElement(element);

// Compress screenshot
const compressed = await ScreenshotCapture.compressScreenshot(data, 0.7);

// Get size
const sizeKb = ScreenshotCapture.calculateSize(dataUrl);
```

---

### 2. Session Recording
```typescript
import { sessionRecorder } from './utils/sessionRecording';

// Start recording (30 sec max, 500ms intervals)
sessionRecorder.start();

// Check status
const isRecording = sessionRecorder.isActive();
const duration = sessionRecorder.getDuration(); // ms
const frames = sessionRecorder.getFrameCount();

// Pause/Resume
sessionRecorder.pause();
sessionRecorder.resume();

// Stop recording
const recording = sessionRecorder.stop();
// { id, frames: Screenshot[], startTime, endTime, duration }

// Export
const recordingData = sessionRecorder.export();

// Clear
sessionRecorder.clear();
```

---

### 3. Duplicate Detection
```typescript
import { DuplicateDetector } from './utils/duplicateDetection';

const detector = new DuplicateDetector(githubToken);

// Find duplicates in repository
const matches = await detector.findDuplicates(
  repo,          // GitHubRepo
  title,         // string
  body,          // string
  0.6            // threshold (0-1)
);
// Returns: DuplicateIssueMatch[]

// Check if title is likely duplicate
const isDuplicate = detector.isDuplicateLikely(
  'New bug',
  ['Existing bug', 'Another bug'],
  0.7
);

// Group similar issues
const groups = detector.groupSimilarIssues(
  issues,        // { title, body, id }[]
  0.65           // threshold
);
```

---

### 4. Issue Templates
```typescript
import { TemplateManager } from './utils/templates';

// Create template
const template = await TemplateManager.createTemplate({
  name: 'Bug Report',
  description: 'Standard bug template',
  body: '## Description\n...',
  labels: ['bug', 'urgent']
});

// Get all templates
const templates = await TemplateManager.getAllTemplates();

// Get specific template
const template = await TemplateManager.getTemplate(id);

// Update template
await TemplateManager.updateTemplate(id, { name: 'New Name' });

// Delete template
await TemplateManager.deleteTemplate(id);

// Import/Export
await TemplateManager.importTemplates(templates);
const exported = await TemplateManager.exportTemplates();

// Get defaults
const defaults = TemplateManager.getDefaultTemplates();

// Reset to defaults
await TemplateManager.resetToDefaults();
```

---

### 5. Data Export
```typescript
import { DataExporter, DataImporter } from './utils/dataExport';

// Export to different formats
const json = DataExporter.exportAsJSON(capturedData);
const har = DataExporter.exportAsHAR(capturedData);
const markdown = DataExporter.exportAsMarkdown(capturedData);
const csv = DataExporter.exportAsCSV(capturedData);
const html = DataExporter.exportAsHTML(capturedData);

// Download file
DataExporter.downloadFile(
  content,           // string
  'report.json',     // filename
  'application/json' // MIME type
);

// Import
const data = await DataImporter.importHAR(fileContent);
const data = await DataImporter.importJSON(fileContent);
```

---

### 6. Team & Projects
```typescript
import { TeamAndProjectsManager } from './utils/teamAndProjects';

const manager = new TeamAndProjectsManager(githubToken);

// Get team members
const members = await manager.getTeamMembers(owner, repo);
// Returns: TeamMember[]

// Get organization teams
const teams = await manager.getOrganizationTeams(org);

// Get organization projects
const projects = await manager.getOrganizationProjects(org);

// Get project columns
const columns = await manager.getProjectColumns(projectId);

// Add issue to project
await manager.addIssueToProject(issueUrl, columnId);

// Assign issue to members
await manager.assignIssueToMembers(owner, repo, issueNumber, ['alice', 'bob']);

// Extract mentions from text
const mentions = manager.extractMentions('Please assign to @alice and @bob');

// Format mentions
const markdown = manager.formatTeamMentions(['alice', 'bob']);
// Output: "@alice, @bob"

// Get suggested assignees
const suggested = await manager.getSuggestedAssignees(owner, repo, 5);
```

---

### 7. State Capture
```typescript
import { 
  StateCaptureManager, 
  StorageCaptureManager, 
  WebSocketCaptureManager 
} from './utils/stateCapture';

// STATE MANAGERS
// Automatically detect and capture available states
const states = StateCaptureManager.captureAllStates();
// Supports: Redux, Vuex, Pinia, Zustand, Jotai

// Individual captures
const reduxState = StateCaptureManager.captureReduxState();
const vuexState = StateCaptureManager.captureVuexState();
const piniaState = StateCaptureManager.capturePiniaState();
const zustandState = StateCaptureManager.captureZustandState();
const jotaiState = StateCaptureManager.captureJotaiState();

// Format for GitHub
const markdown = StateCaptureManager.formatStateForIssue(states);

// STORAGE
// Capture localStorage and sessionStorage
const storage = StorageCaptureManager.captureAllStorage();
// { localStorage: {...}, sessionStorage: {...}, timestamp }

const localOnly = StorageCaptureManager.captureLocalStorage();
const sessionOnly = StorageCaptureManager.captureSessionStorage();

const markdown = StorageCaptureManager.formatStorageForIssue(storage);

// WEBSOCKET
// Install proxy to capture WebSocket messages
WebSocketCaptureManager.installWebSocketProxy();

// Get captured messages
const messages = WebSocketCaptureManager.getMessages();
// [{ id, url, type: 'sent'|'received', data, timestamp, size }]

// Clear messages
WebSocketCaptureManager.clearMessages();

// Format for GitHub
const markdown = WebSocketCaptureManager.formatMessagesForIssue(messages);
```

---

## 🎨 UI Components Usage

### Store Integration
```typescript
import { useStore } from './store/useStore';

const {
  // Screenshots
  screenshots,
  addScreenshot,
  removeScreenshot,
  clearScreenshots,
  
  // Recording
  isRecording,
  setIsRecording,
  sessionRecording,
  setSessionRecording,
  
  // State & Storage
  capturedStates,
  setCapturedStates,
  capturedStorage,
  setCapturedStorage,
  
  // WebSocket
  webSocketMessages,
  addWebSocketMessage,
  clearWebSocketMessages,
  
  // Templates & Duplicates
  issueTemplates,
  setIssueTemplates,
  duplicateMatches,
  setDuplicateMatches,
  
  // Team
  selectedAssignees,
  setSelectedAssignees,
  selectedTeamMembers,
  setSelectedTeamMembers,
} = useStore();
```

---

### Component Examples

#### ScreenshotTab
```typescript
<ScreenshotTab />
// Features:
// - Capture button
// - Screenshot gallery
// - Download/compress/delete
// - Size display
```

#### RecordingTab
```typescript
<RecordingTab />
// Features:
// - Start/pause/stop controls
// - Duration counter
// - Frame preview
// - Download session
```

#### DuplicateDetectionTab
```typescript
<DuplicateDetectionTab />
// Features:
// - Threshold adjustment
// - Repository selection
// - Similarity results
// - Link to existing issues
```

#### TemplatesTab
```typescript
<TemplatesTab />
// Features:
// - Create/edit/delete templates
// - Apply template to form
// - Template gallery
// - Default templates
```

#### DataExportTab
```typescript
<DataExportTab />
// Features:
// - Format selection (5 formats)
// - Data summary
// - Export button
// - Import file picker
```

#### TeamMentionsTab
```typescript
<TeamMentionsTab />
// Features:
// - Team member search
// - Multi-select
// - Suggested members
// - @mention formatting
```

---

## 🔌 GitHub API Extension

```typescript
import { GitHubAPI } from './utils/github';

const api = new GitHubAPI(token);

// Existing methods
await api.validateToken();
await api.getRepositories();
await api.getLabels(owner, repo);
await api.createLabel(owner, repo, {...});
await api.createIssue(owner, repo, issue);
await api.searchIssues(owner, repo, query);
await api.getIssue(owner, repo, issueNumber);

// NEW: Get repository issues
const issues = await api.getRepositoryIssues(owner, repo, 'open');

// NEW: Generic request (for custom endpoints)
const response = await api.request('/repos/{owner}/{repo}/custom', {
  headers: { 'X-GitHub-Api-Version': '2022-11-28' }
});
```

---

## 📊 Types Reference

```typescript
// Screenshot
interface Screenshot {
  id: string;
  data: string;        // base64
  timestamp: number;
  width: number;
  height: number;
}

// Session Recording
interface SessionRecording {
  id: string;
  frames: Screenshot[];
  startTime: number;
  endTime: number;
  duration: number;
}

// Duplicate Match
interface DuplicateIssueMatch {
  id: number;
  title: string;
  body: string;
  similarity: number;   // 0-1
  url: string;
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Issue Template
interface IssueTemplate {
  id: string;
  name: string;
  description: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

// Team Member
interface TeamMember {
  id: number;
  login: string;
  avatar_url: string;
  name?: string;
  email?: string;
}

// State Capture
interface StateCapture {
  type: 'redux' | 'vuex' | 'pinia' | 'zustand' | 'jotai';
  state: Record<string, any>;
  timestamp: number;
}

// Storage Capture
interface StorageCapture {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  timestamp: number;
}

// WebSocket Message
interface WebSocketMessage {
  id: string;
  url: string;
  type: 'sent' | 'received';
  data: string;
  timestamp: number;
  size: number;
}
```

---

## 💡 Common Workflows

### Capture Everything for Bug Report
```typescript
// Screenshots
const screenshot = await ScreenshotCapture.captureVisibleTab();
store.addScreenshot(screenshot);

// State
const states = StateCaptureManager.captureAllStates();
store.setCapturedStates(states);

// Storage
const storage = StorageCaptureManager.captureAllStorage();
store.setCapturedStorage(storage);

// WebSocket
WebSocketCaptureManager.installWebSocketProxy();

// Check duplicates
const detector = new DuplicateDetector(token);
const duplicates = await detector.findDuplicates(repo, title, body);
store.setDuplicateMatches(duplicates);

// Assign team
store.setSelectedAssignees(['alice', 'bob']);

// Export
const harData = DataExporter.exportAsHAR(capturedData);
DataExporter.downloadFile(harData, 'bug-report.har', 'application/json');
```

### Create Issue from Template with Team
```typescript
// Load templates
const templates = await TemplateManager.getAllTemplates();
store.setIssueTemplates(templates);

// Apply template
const template = templates[0];
store.setIssueTitle(template.name);
store.setIssueBody(template.body);
store.setIssueLabels(template.labels);

// Get team
const manager = new TeamAndProjectsManager(token);
const members = await manager.getTeamMembers(owner, repo);

// Select assignees
store.setSelectedAssignees(['alice']);

// Create issue with API
await api.createIssue(owner, repo, {
  title: issueTitle,
  body: issueBody,
  labels: issueLabels,
  assignees: selectedAssignees
});
```

---

## 🧪 Testing Utilities

```typescript
// Test duplicate detection
const detector = new DuplicateDetector(token);
console.log(detector.calculateSimilarity('hello', 'hallo')); // ~0.8

// Test templates
const template = TemplateManager.getDefaultTemplates()[0];
console.log(template.name); // 'Bug Report'

// Test export
const html = DataExporter.exportAsHTML(capturedData);
console.log(html.includes('<html>')); // true

// Test storage
const storage = StorageCaptureManager.captureAllStorage();
console.log(storage.timestamp); // current timestamp
```

---

## 🐛 Error Handling

All utilities include error handling:

```typescript
try {
  const screenshot = await ScreenshotCapture.captureVisibleTab();
} catch (error) {
  console.error('Screenshot failed:', error);
}

try {
  const duplicates = await detector.findDuplicates(repo, title, body);
} catch (error) {
  console.error('Duplicate check failed:', error);
  // Falls back to no duplicates
}

try {
  const members = await manager.getTeamMembers(owner, repo);
} catch (error) {
  console.error('Team fetch failed:', error);
  // Returns empty array []
}
```

---

## 📖 Documentation Files

- `PHASE_2_3_COMPLETE.md` - Full feature documentation
- `PHASE_2_3_IMPLEMENTATION.md` - Architecture & design
- `ACTION_ITEMS.md` - Deployment checklist
- Source code comments - Inline documentation

---

**Last Updated**: October 27, 2025

