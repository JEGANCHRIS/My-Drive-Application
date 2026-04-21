# N8n Workflow Integration TODO

## Plan Breakdown & Progress

✅ **Step 1**: User approved edit plan for Workflow.jsx  
✅ **Step 2**: Create TODO.md for tracking (this file)

⏳ **Step 3**: Edit frontend/src/components/Workflow.jsx

- Replace handleSelect to window.open(N8N_URL, '\_blank') on n8n select
- Remove iframeError state & iframe
- Add overlay with "Opened in new tab" message + link + close button

⏳ **Step 4**: Test changes

- cd frontend && npm run dev
- Sidebar → Workflow → select n8n → verify new tab + overlay

⏳ **Step 5**: Update TODO.md with completion  
⏳ **Step 6**: attempt_completion
