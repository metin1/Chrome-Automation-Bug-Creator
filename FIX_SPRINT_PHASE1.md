# 🔧 FIX SPRINT - PHASE 1 FIXES

**Date**: October 28, 2025  
**Sprint Focus**: UI/UX Fixes & Feature Improvements  
**Status**: 🚀 IN PROGRESS

---

## 📋 ISSUES TO FIX

### Issue #1: ❌ All tabs not visible on screen
**Problem**: Tabs overflow, not all 11 tabs visible at once  
**Severity**: HIGH 🔴  
**Status**: 🔴 NEEDS FIX

**Fix Options**:
- [ ] Make tabs scrollable horizontally
- [ ] Use dropdown for hidden tabs
- [ ] Multi-row tabs (wrap to second line)
- [ ] Collapsible tab groups

**Recommended**: Horizontal scroll or dropdown menu

---

### Issue #2: ❌ Selection state lost when clicking outside extension
**Problem**: Form selections (checkboxes, etc.) reset when extension closed/reopened  
**Severity**: MEDIUM 🟡  
**Status**: 🔴 NEEDS FIX

**Root Cause**: State not persisted to storage  
**Fix**: 
- [ ] Save selections to localStorage when changed
- [ ] Restore from localStorage on extension open
- [ ] Use Zustand persist middleware properly

---

### Issue #3: ❌ Recording stops when interacting with webpage + data lost
**Problem**: Starting recording, then clicking on webpage causes extension to close; data lost  
**Severity**: HIGH 🔴  
**Status**: 🔴 NEEDS FIX

**Root Cause**: Extension popup closes when user clicks outside  
**Fix**:
- [ ] Keep recording running even if popup closed
- [ ] Store recording data in chrome.storage
- [ ] Persist frames to storage every 2 seconds
- [ ] Resume recording when popup reopens

---

### Issue #4: ❌ Can't access Settings, Duplicates, Templates, Export, Team tabs
**Problem**: Tabs exist but aren't scrollable/visible  
**Severity**: HIGH 🔴  
**Status**: 🔴 NEEDS FIX

**Related to Issue #1** - Same root cause (tab overflow)

**Fix**:
- [ ] Add horizontal scroll to tab navigation
- [ ] Or implement tab menu dropdown
- [ ] Or wrap tabs to multiple rows

---

### Issue #5: ❌ Create issue doesn't include screenshots/recordings
**Problem**: When creating issue, screenshots & recordings aren't included  
**Severity**: HIGH 🔴  
**Status**: 🔴 NEEDS FIX

**Fix**:
- [ ] Add screenshots to issue body as attachments
- [ ] Convert recording frames to video/GIF
- [ ] Include metadata (timestamps, etc)
- [ ] Format nicely in issue description

---

### Issue #6: ❌ "Generate from Captured Data" uses ALL data, not selected
**Problem**: Should only use user-selected logs/requests, but adds everything  
**Severity**: MEDIUM 🟡  
**Status**: 🔴 NEEDS FIX

**Fix**:
- [ ] Filter by `selectedConsoleLogs` array
- [ ] Filter by `selectedNetworkRequests` array
- [ ] Only include checked items
- [ ] Respect user selections

---

### Issue #7: ❌ Additional Logs not added to GitHub issue
**Problem**: Additional Logs field ignored when creating issue  
**Severity**: MEDIUM 🟡  
**Status**: 🔴 NEEDS FIX

**Fix**:
- [ ] Include `additionalLogs` in issue body
- [ ] Add "Additional Logs" section
- [ ] Format in code block
- [ ] Always include if not empty

---

## 🎯 FIX PRIORITY

**Phase 1 (Urgent - Do First)**:
1. ✅ Issue #1: Tab visibility - makes app unusable
2. ✅ Issue #4: Access hidden tabs - depends on #1
3. ✅ Issue #5: Include screenshots/recordings - core feature

**Phase 2 (Important)**:
4. ⏳ Issue #3: Persist recording data
5. ⏳ Issue #2: Persist form selections
6. ⏳ Issue #6: Respect selected items
7. ⏳ Issue #7: Include additional logs

---

## 🔧 IMPLEMENTATION PLAN

### FIX #1: Make Tabs Scrollable

**File**: `src/popup/App.tsx`

```typescript
// Make tab container scrollable
<div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
  {tabs.map(tab => (
    // ...tab buttons...
  ))}
</div>

// Add to styles.css
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Status**: 🔴 NEEDS IMPLEMENTATION

---

### FIX #3: Persist Recording Data

**File**: `src/utils/sessionRecording.ts`

```typescript
// Save to chrome.storage periodically
async saveToStorage() {
  const sessionData = {
    frames: this.frames,
    duration: this.duration,
    timestamp: Date.now()
  };
  await chrome.storage.local.set({ 
    'activeRecording': sessionData 
  });
}

// Restore on startup
async restoreFromStorage() {
  const data = await chrome.storage.local.get('activeRecording');
  if (data.activeRecording) {
    this.frames = data.activeRecording.frames;
    this.duration = data.activeRecording.duration;
  }
}
```

**Status**: 🔴 NEEDS IMPLEMENTATION

---

### FIX #5: Include Screenshots in Issue

**File**: `src/popup/components/MainTab.tsx`

```typescript
const buildIssueWithMedia = async () => {
  let body = generateCompleteBody();
  
  // Add screenshots
  if (screenshots.length > 0) {
    body += "\n\n## Screenshots\n\n";
    screenshots.forEach((screenshot, idx) => {
      body += `![Screenshot ${idx + 1}](data:image/png;base64,${screenshot.data})\n`;
    });
  }
  
  // Add recording info
  if (sessionRecording) {
    body += "\n\n## Session Recording\n\n";
    body += `- Duration: ${sessionRecording.duration}ms\n`;
    body += `- Frames: ${sessionRecording.frames.length}\n`;
  }
  
  return body;
};
```

**Status**: 🔴 NEEDS IMPLEMENTATION

---

### FIX #6: Respect Selected Items

**File**: `src/popup/components/MainTab.tsx`

```typescript
const generateIssueBody = () => {
  let body = `## Page Information\n\n`;
  
  // Only use SELECTED console logs
  const selectedLogs = capturedData?.consoleLogs?.filter(
    log => selectedConsoleLogs.includes(log.id)
  );
  
  // Only use SELECTED network requests
  const selectedRequests = capturedData?.networkRequests?.filter(
    req => selectedNetworkRequests.includes(req.id)
  );
  
  // Add only selected items...
};
```

**Status**: 🔴 NEEDS IMPLEMENTATION

---

### FIX #7: Include Additional Logs

**File**: `src/popup/components/MainTab.tsx`

```typescript
const generateCompleteBody = (): string => {
  let body = `## Page Information\n\n`;
  
  // ... existing code ...
  
  // Add Additional Logs ALWAYS if not empty
  if (additionalLogs.trim()) {
    body += `\n## Additional Logs\n\n`;
    body += `\`\`\`\n${additionalLogs}\n\`\`\`\n\n`;
  }
  
  return body;
};
```

**Status**: 🔴 NEEDS IMPLEMENTATION

---

## 📊 FIX PROGRESS

```
Issue #1: Tab Visibility        🔴 TODO
Issue #2: Persist Selections    🔴 TODO  
Issue #3: Persist Recording     🔴 TODO
Issue #4: Access Hidden Tabs    🔴 TODO (depends on #1)
Issue #5: Include Media         🔴 TODO
Issue #6: Respect Selections    🔴 TODO
Issue #7: Include Extra Logs    🔴 TODO

Progress: 0/7 Complete
```

---

## 🎯 NEXT STEPS

1. **Fix Tab Visibility** (Issue #1) - URGENT
2. **Fix Screenshot/Recording inclusion** (Issue #5)
3. **Fix Data Persistence** (Issues #2, #3)
4. **Fix Selection logic** (Issue #6)
5. **Fix Additional Logs** (Issue #7)
6. **Test all features**
7. **Rebuild & deploy**

---

## 📝 FILES TO MODIFY

- [ ] `src/popup/App.tsx` - Tab scrolling
- [ ] `src/popup/components/MainTab.tsx` - Issue creation + selections
- [ ] `src/utils/sessionRecording.ts` - Persist recording
- [ ] `src/store/useStore.ts` - Update persist config
- [ ] `src/popup/styles.css` - Add scrollbar styling
- [ ] `src/popup/components/RecordingTab.tsx` - Restore recording

---

**Sprint Status**: 🚀 READY TO START  
**Estimated Time**: 4-6 hours  
**Difficulty**: MEDIUM  

Let me know when you're ready to start implementing fixes! 🛠️

