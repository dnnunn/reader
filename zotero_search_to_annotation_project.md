# Zotero Search-to-Annotation Project Documentation

## Project Overview

### Goal
Create a feature for Zotero's PDF reader that converts temporary search highlights into permanent annotations. When a user searches for terms in a PDF using "Find in Document", provide an option to make all the highlighted search results into permanent, colored highlights that are stored in the Zotero database.

### Problem Statement
Currently, Zotero's PDF reader has two separate highlighting systems:
1. **Temporary search highlights** - Created by "Find in Document" feature, disappear when search is closed
2. **Permanent annotations** - Created manually by selecting text and choosing highlight colors, stored permanently

There is no way to convert search results into permanent annotations, forcing users to manually re-highlight important search terms.

### Innovation Factor
**This functionality does not currently exist** in Zotero or any known plugins. Research conducted on 2025-05-29 confirmed this is a novel feature that would benefit many users.

## Technical Architecture

### Repository Structure
```
~/zotero-projects/
├── zotero/          # Main Zotero codebase (reference only)
└── reader/          # PDF reader (main development focus)
    ├── src/         # Source code for reader
    ├── build/       # Built application files
    └── node_modules/ # Dependencies
```

### Key Systems to Understand

#### 1. Search System (Temporary Highlights)
- **Location**: Zotero reader repository (https://github.com/zotero/reader)
- **Technology**: Built on PDF.js
- **Function**: "Find in Document" (magnifying glass icon) creates temporary highlights
- **Storage**: Not persistent, disappears when search closed

#### 2. Annotation System (Permanent Highlights)
- **Storage**: Zotero database (not in PDF file itself)
- **Creation**: Manual text selection + color choice
- **Properties**: text content, position, color, page number, annotation ID
- **Syncing**: Automatically syncs across devices via Zotero

#### 3. PDF.js Integration
- **Base Technology**: Mozilla's PDF.js library
- **Customization**: Zotero uses modified version
- **Text Extraction**: Provides `page.getTextContent()` and search functionality

## Development Strategy

### Phase 1: Research and Setup ✅
- [x] Identify repositories needed
- [x] Confirm feature novelty
- [x] Set up development environment
- [x] Clone repositories

### Phase 2: Code Analysis
**Next Steps:**
```bash
cd ~/zotero-projects/reader
find src/ -name "*search*" -o -name "*find*" -o -name "*highlight*"
find src/ -name "*annotation*" -o -name "*annot*"
grep -r "Find in document" src/
grep -r "magnifying" src/
```

**Goals:**
- Locate search implementation code
- Understand annotation creation API
- Map data structures for both systems

### Phase 3: Implementation Strategy

#### Core Implementation Approach
1. **Hook into search results**: Capture text ranges/positions from PDF.js search
2. **Convert to annotation objects**: Transform search data into Zotero annotation format
3. **Batch create annotations**: Use existing annotation API to create permanent highlights
4. **Add UI trigger**: Create "Make Search Results Permanent" button/option

#### Technical Requirements
```javascript
// Pseudo-code structure
const searchResults = pdfViewer.findController.pageMatches;

const annotations = searchResults.map(result => ({
  type: 'highlight',
  color: '#ffff00', // yellow or user-selected
  text: result.matchedText,
  position: result.textPosition,
  pageIndex: result.pageNumber,
  // ... other annotation properties
}));

annotationManager.createAnnotations(annotations);
```

### Phase 4: User Interface
- Add button/menu option in search interface
- Allow color selection for batch highlights
- Progress indicator for batch operations
- Undo functionality

### Phase 5: Testing and Refinement
- Test with various PDF types
- Handle edge cases (line breaks, special characters)
- Performance optimization for large documents
- User experience improvements

## Setup Instructions

### Prerequisites
- Node.js 18+
- Git
- GitHub Desktop (optional)
- Code editor (VS Code recommended)

### Repository Setup
```bash
# Create project directory
mkdir ~/zotero-projects
cd ~/zotero-projects

# Clone repositories
git clone https://github.com/zotero/zotero.git
git clone --recursive https://github.com/zotero/reader.git

# Setup reader development environment
cd reader
NODE_OPTIONS=--openssl-legacy-provider npm i
NODE_OPTIONS=--openssl-legacy-provider npm run build
npm start
# Access at: http://localhost:3000/dev/reader.html
```

### Development Environment Notes
- **Security vulnerabilities**: npm audit shows 44 vulnerabilities in dependencies
- **Impact**: Mostly development tools, won't affect final functionality
- **Action**: Proceed with development, address later during modernization
- **Build issues**: Use `NODE_OPTIONS=--openssl-legacy-provider` for compatibility

## Project Independence Strategy

### Publishing Approach: Fork Method (Recommended)
1. **Fork on GitHub**: Create `https://github.com/YOUR-USERNAME/reader`
2. **Clone your fork**: Work from your own repository
3. **Benefits**: 
   - Proper attribution to original work
   - Can publish independently
   - Can still pull updates from original
   - Professional open source practice

### Legal Considerations
- **License**: Zotero reader is open source (likely AGPL)
- **Requirements**: Keep original license, credit authors, make source available
- **Compliance**: Your open publication plan already meets requirements

## Research Findings

### Existing Zotero Functionality
- **Manual annotations**: Full-featured highlighting, notes, area selection
- **Search functionality**: "Find in Document" with temporary highlights
- **Annotation extraction**: "Add Note from Annotations" creates searchable notes
- **Import annotations**: Can import external PDF annotations (read-only initially)

### Related Plugins Analyzed
- **ZotFile**: Extracts existing annotations, doesn't create new ones
- **PDF Translate**: Creates annotations from translations, not search
- **Better Notes**: Enhances note-taking, no search-to-annotation conversion
- **PDF Preview**: Shows annotations in sidebar, no search conversion

### Community Need
- Forum discussions show users want better search-annotation integration
- No existing solutions for this specific use case
- High potential for user adoption

## Success Metrics

### Technical Goals
- [ ] Successfully convert search results to annotations
- [ ] Preserve search result positions accurately
- [ ] Handle multi-page search results
- [ ] Support batch operations efficiently
- [ ] Maintain annotation data integrity

### User Experience Goals
- [ ] Intuitive UI integration
- [ ] Fast batch processing
- [ ] Color customization options
- [ ] Undo/redo functionality
- [ ] Cross-device synchronization

### Project Goals
- [ ] Open source publication
- [ ] Community adoption
- [ ] Potential integration into main Zotero
- [ ] Documentation and tutorials
- [ ] Plugin ecosystem contribution

## Key File Locations to Investigate

### Search Implementation
```
reader/src/
├── components/        # UI components
├── dom/              # DOM manipulation
├── lib/              # Core libraries
└── pdf/              # PDF.js integration
```

### Annotation System
```
reader/src/
├── annotations/      # Annotation management
├── reader/           # Main reader logic
└── common/           # Shared utilities
```

## Next Immediate Actions

1. **Build and test reader**: Ensure development environment works
2. **Explore codebase**: Map search and annotation implementations
3. **Create feature branch**: `git checkout -b search-to-annotations-feature`
4. **Prototype minimal version**: Convert single search result first
5. **Iterate and expand**: Add batch processing and UI integration

## Resources and References

### Documentation
- Zotero PDF Reader: https://www.zotero.org/support/pdf_reader
- PDF.js Documentation: https://mozilla.github.io/pdf.js/
- Zotero Forums: https://forums.zotero.org/

### Code Repositories
- Main Zotero: https://github.com/zotero/zotero
- PDF Reader: https://github.com/zotero/reader
- PDF.js: https://github.com/mozilla/pdf.js

### Community
- Zotero Forums: Active developer community
- GitHub Issues: Feature requests and bug reports
- Plugin Development: Examples and best practices

---

**Project Status**: Setup Complete, Ready for Development
**Last Updated**: May 29, 2025
**Next Milestone**: Code exploration and mapping