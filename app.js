/* ==========================================================================
   Modern Text-to-Handwriting JavaScript Application
   ========================================================================= */

(function () {
    // DOM Elements
    const elements = {
        themeToggle: document.getElementById('theme-toggle'),
        textInput: document.getElementById('text-input'),
        fontSelect: document.getElementById('font-select'),
        fontSizeSlider: document.getElementById('font-size'),
        fontSizeVal: document.getElementById('font-size-val'),
        lineHeightSlider: document.getElementById('line-height'),
        lineHeightVal: document.getElementById('line-height-val'),
        letterSpacingSlider: document.getElementById('letter-spacing'),
        letterSpacingVal: document.getElementById('letter-spacing-val'),
        wordSpacingSlider: document.getElementById('word-spacing'),
        wordSpacingVal: document.getElementById('word-spacing-val'),
        
        paperSizeSelect: document.getElementById('paper-size'),
        paperTemplateSelect: document.getElementById('paper-template'),
        customBgInput: document.getElementById('custom-bg-input'),
        removeBgBtn: document.getElementById('remove-bg-btn'),
        scannerEffectCheckbox: document.getElementById('scanner-effect'),
        
        colorPresets: document.querySelectorAll('.color-preset'),
        customColorInput: document.getElementById('custom-color'),
        
        fontFileInput: document.getElementById('font-file-input'),
        fontBadgeContainer: document.getElementById('font-badge-container'),
        
        wordJitterSlider: document.getElementById('word-jitter'),
        wordJitterVal: document.getElementById('word-jitter-val'),
        lineJitterSlider: document.getElementById('line-jitter'),
        lineJitterVal: document.getElementById('line-jitter-val'),
        
        downloadPngBtn: document.getElementById('download-png'),
        downloadPdfBtn: document.getElementById('download-pdf'),
        addPageBtn: document.getElementById('add-page-btn'),
        previewContainer: document.getElementById('preview-container'),
        
        progressModal: document.getElementById('progress-modal'),
        progressFill: document.getElementById('progress-fill'),
        progressText: document.getElementById('progress-text'),
        modalTitle: document.getElementById('modal-title'),
        modalDesc: document.getElementById('modal-desc'),
        closeModalBtn: document.getElementById('close-modal'),
        
        formattingToolbar: null,
        fmtBold: document.getElementById('fmt-bold'),
        fmtItalic: document.getElementById('fmt-italic'),
        fmtUnderline: document.getElementById('fmt-underline'),
        fmtHighlight: document.getElementById('fmt-highlight'),
        fmtClear: document.getElementById('fmt-clear'),
        fmtFont: document.getElementById('fmt-font'),
        fmtSize: document.getElementById('fmt-size'),
        fmtColor: document.getElementById('fmt-color'),
        
        marginLeftSlider: document.getElementById('margin-left'),
        marginLeftVal: document.getElementById('margin-left-val'),
        marginTopSlider: document.getElementById('margin-top'),
        marginTopVal: document.getElementById('margin-top-val'),
        marginRightSlider: document.getElementById('margin-right'),
        marginRightVal: document.getElementById('margin-right-val'),
        marginBottomSlider: document.getElementById('margin-bottom'),
        marginBottomVal: document.getElementById('margin-bottom-val'),
        toggleMarginsBtn: document.getElementById('toggle-margins-btn'),
        
        paperTextureSelect: document.getElementById('paper-texture'),
        mistakeSlider: document.getElementById('mistake-jitter'),
        mistakeVal: document.getElementById('mistake-jitter-val'),
        fmtImageInput: document.getElementById('fmt-image-input')
    };

    // App State Configuration
    const state = {
        theme: 'dark', // 'dark' or 'light'
        text: 'This is a test of the modern Text-to-Handwriting converter.\n\nYou can write anything here and it will be paginated automatically. Adjust the sliders on the left to change fonts, spacing, margins, or ink colors. You can even upload your own handwriting font file (TTF/OTF) to make it look exactly like your handwriting!\n\nGive it a try and enjoy your beautifully generated, scanned-look handwritten assignments!',
        fontFamily: "'Caveat', cursive",
        fontSize: 19,
        lineHeight: 28,
        letterSpacing: 0,
        wordSpacing: 0.12,
        
        paperSize: 'a4', // 'a4' or 'letter'
        paperTemplate: 'ruled', // 'ruled', 'grid', 'plain'
        customBgDataUrl: null,
        scannerEffect: false,
        
        inkColor: '#0011ff',
        wordJitter: 0.8, // Max rotation angle in degrees
        lineJitter: 0.6, // Max vertical displacement in px
        
        marginLeft: 70,
        marginTop: 65,
        marginRight: 40,
        marginBottom: 50,
        showMarginHelper: false,
        
        paperTexture: 'none', // 'none', 'crumpled', 'spiral', 'shadow'
        mistakeFrequency: 0, // percentage 0 to 5
        
        uploadedFonts: []
    };

    // Page Dimensions mapping (at 96 DPI)
    const paperDimensions = {
        a4: { width: 794, height: 1123, jspdf: 'a4' },
        letter: { width: 816, height: 1056, jspdf: 'letter' }
    };

    // Initialize Application
    function init() {
        bindEvents();
        loadSavedState();
        applyTheme();
        syncControlsWithState();
        triggerRender();
    }

    // Bind UI Event Listeners
    function bindEvents() {
        // Theme Toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Text input changes (Debounced)
        elements.textInput.addEventListener('input', debounce(function (e) {
            state.text = e.target.value;
            triggerRender();
        }, 150));

        elements.textInput.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                insertPageBreak();
            }
        });

        // Font selection
        elements.fontSelect.addEventListener('change', function (e) {
            state.fontFamily = e.target.value;
            triggerRender();
        });

        // Sliders & Values Sync
        setupSlider(elements.fontSizeSlider, elements.fontSizeVal, 'fontSize', 'px', triggerRender);
        setupSlider(elements.lineHeightSlider, elements.lineHeightVal, 'lineHeight', 'px', function(val) {
            document.documentElement.style.setProperty('--line-height', `${val}px`);
            triggerRender();
        });
        setupSlider(elements.letterSpacingSlider, elements.letterSpacingVal, 'letterSpacing', 'px', triggerRender);
        setupSlider(elements.wordSpacingSlider, elements.wordSpacingVal, 'wordSpacing', 'em', triggerRender);
        
        setupSlider(elements.wordJitterSlider, elements.wordJitterVal, 'wordJitter', '°', triggerRender);
        setupSlider(elements.lineJitterSlider, elements.lineJitterVal, 'lineJitter', 'px', triggerRender);

        // Page Layout Sliders
        setupSlider(elements.marginLeftSlider, elements.marginLeftVal, 'marginLeft', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-left', `${val}px`);
            triggerRender();
        });
        setupSlider(elements.marginTopSlider, elements.marginTopVal, 'marginTop', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-top', `${val}px`);
            triggerRender();
        });
        setupSlider(elements.marginRightSlider, elements.marginRightVal, 'marginRight', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-right', `${val}px`);
            triggerRender();
        });
        setupSlider(elements.marginBottomSlider, elements.marginBottomVal, 'marginBottom', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-bottom', `${val}px`);
            triggerRender();
        });

        elements.toggleMarginsBtn.addEventListener('click', function() {
            state.showMarginHelper = !state.showMarginHelper;
            elements.toggleMarginsBtn.classList.toggle('active', state.showMarginHelper);
            const pages = document.querySelectorAll('.paper-page');
            pages.forEach(p => p.classList.toggle('margin-highlight', state.showMarginHelper));
        });

        // Paper Settings
        elements.paperSizeSelect.addEventListener('change', function (e) {
            state.paperSize = e.target.value;
            updatePaperDimensions();
            triggerRender();
        });

        elements.paperTemplateSelect.addEventListener('change', function (e) {
            state.paperTemplate = e.target.value;
            triggerRender();
        });

        // Custom Background upload
        elements.customBgInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    state.customBgDataUrl = event.target.result;
                    elements.removeBgBtn.style.display = 'block';
                    triggerRender();
                };
                reader.readAsDataURL(file);
            }
        });

        elements.removeBgBtn.addEventListener('click', function () {
            state.customBgDataUrl = null;
            elements.customBgInput.value = '';
            elements.removeBgBtn.style.display = 'none';
            triggerRender();
        });

        // Scanner Effect
        elements.scannerEffectCheckbox.addEventListener('change', function (e) {
            state.scannerEffect = e.target.checked;
            const pages = document.querySelectorAll('.paper-page');
            pages.forEach(p => p.classList.toggle('scanner-effect', state.scannerEffect));
        });

        // Ink Colors
        elements.colorPresets.forEach(preset => {
            preset.addEventListener('click', function () {
                elements.colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                state.inkColor = preset.getAttribute('data-color');
                elements.customColorInput.value = state.inkColor;
                triggerRender();
            });
        });

        elements.customColorInput.addEventListener('input', function (e) {
            elements.colorPresets.forEach(p => p.classList.remove('active'));
            state.inkColor = e.target.value;
            triggerRender();
        });

        // Paper Texture Selection
        elements.paperTextureSelect.addEventListener('change', function (e) {
            state.paperTexture = e.target.value;
            triggerRender();
        });

        // Mistake Frequency Slider
        setupSlider(elements.mistakeSlider, elements.mistakeVal, 'mistakeFrequency', '%', triggerRender);

        // Format Image Upload Inserter
        elements.fmtImageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    restoreSelection();
                    const dataUrl = event.target.result;
                    
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    img.className = 'ink-colored';
                    
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        range.insertNode(img);
                        
                        // Insert standard line break after the image for clean flow
                        const br = document.createElement('br');
                        range.insertNode(br);
                        
                        syncTextFromEditable();
                        triggerRender();
                    }
                    elements.fmtImageInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        });

        // Custom Font Upload
        elements.fontFileInput.addEventListener('change', handleFontUpload);

        // Accordion headers
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', function () {
                const section = header.parentElement;
                section.classList.toggle('collapsed');
            });
        });

        // Exports
        elements.addPageBtn.addEventListener('click', insertPageBreak);
        elements.downloadPngBtn.addEventListener('click', exportPNG);
        elements.downloadPdfBtn.addEventListener('click', exportPDF);
        elements.closeModalBtn.addEventListener('click', function() {
            elements.progressModal.classList.remove('active');
        });
        // Right Panel Formatting Actions
        // Save the active contenteditable selection before panel button clicks blur the page
        let savedRange = null;

        function saveSelection() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                savedRange = sel.getRangeAt(0).cloneRange();
            }
        }

        function restoreSelection() {
            if (!savedRange) return;
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        const toolbarItems = [
            elements.fmtBold, elements.fmtItalic, elements.fmtUnderline,
            elements.fmtHighlight, elements.fmtClear
        ];
        toolbarItems.forEach(item => {
            if (item) {
                // Save selection on mousedown BEFORE focus is lost
                item.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    saveSelection();
                });
            }
        });

        // Also save selection when user focuses any select dropdown
        [elements.fmtFont, elements.fmtSize].forEach(el => {
            if (el) {
                el.addEventListener('mousedown', () => saveSelection());
                el.addEventListener('focus', () => saveSelection());
            }
        });
        if (elements.fmtColor) {
            elements.fmtColor.addEventListener('mousedown', () => saveSelection());
            elements.fmtColor.addEventListener('focus', () => saveSelection());
        }

        // Utility: wrap the restored selection with an inline element
        function wrapSelectionWith(tag, styleProps) {
            restoreSelection();
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            if (sel.toString().trim() === '') return;
            const range = sel.getRangeAt(0);
            const el = document.createElement(tag);
            if (styleProps) {
                Object.entries(styleProps).forEach(([k, v]) => el.style[k] = v);
            }
            try {
                range.surroundContents(el);
            } catch (err) {
                const frag = range.extractContents();
                el.appendChild(frag);
                range.insertNode(el);
                const nr = document.createRange();
                nr.selectNodeContents(el);
                sel.removeAllRanges();
                sel.addRange(nr);
            }
            syncTextFromEditable();
        }

        elements.fmtBold.addEventListener('click', () => wrapSelectionWith('b'));
        elements.fmtItalic.addEventListener('click', () => wrapSelectionWith('i'));
        elements.fmtUnderline.addEventListener('click', () => wrapSelectionWith('u'));

        elements.fmtHighlight.addEventListener('click', () => {
            wrapSelectionWith('span', { backgroundColor: 'rgba(250, 204, 21, 0.5)' });
        });

        elements.fmtClear.addEventListener('click', () => {
            restoreSelection();
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            
            // Native format strip first
            document.execCommand('removeFormat', false, null);
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, 'transparent');
            
            // Manual strip of tags and styles within selection to ensure cleanliness
            const range = sel.getRangeAt(0);
            const container = range.commonAncestorContainer;
            let parent = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
            
            while (parent && parent.classList && !parent.classList.contains('paper-content')) {
                const tagName = parent.tagName;
                if (['B', 'I', 'U', 'SPAN', 'MARK', 'FONT'].includes(tagName)) {
                    const parentOfParent = parent.parentNode;
                    while (parent.firstChild) {
                        parentOfParent.insertBefore(parent.firstChild, parent);
                    }
                    parentOfParent.removeChild(parent);
                    parent = parentOfParent;
                } else {
                    parent = parent.parentNode;
                }
            }
            
            syncTextFromEditable();
            triggerRender();
        });

        elements.fmtFont.addEventListener('change', (e) => {
            if (e.target.value) {
                restoreSelection();
                applyStyleToSelection('font-family', e.target.value);
                e.target.value = '';
            }
        });

        elements.fmtSize.addEventListener('change', (e) => {
            if (e.target.value) {
                restoreSelection();
                applyStyleToSelection('font-size', e.target.value);
                e.target.value = '';
            }
        });

        elements.fmtColor.addEventListener('input', (e) => {
            restoreSelection();
            applyStyleToSelection('color', e.target.value);
        });

        // Track selection changes to always have latest range saved
        document.addEventListener('selectionchange', () => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                const anchor = sel.anchorNode;
                // Only save if selection is inside a paper-content
                let node = anchor;
                while (node) {
                    if (node.classList && node.classList.contains('paper-content')) {
                        savedRange = sel.getRangeAt(0).cloneRange();
                        break;
                    }
                    node = node.parentNode;
                }
            }
        });

        // Auto Scale on window resize
        window.addEventListener('resize', debounce(autoScalePages, 100));
    }

    // Setup helper for sliders
    function setupSlider(slider, display, stateKey, unit, callback) {
        slider.addEventListener('input', function (e) {
            let val = parseFloat(e.target.value);
            state[stateKey] = val;
            display.textContent = val + unit;
            if (callback) callback(val);
        });
    }

    // Toggle Themes (Dark / Light)
    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveStateToLocalStorage();
    }

    function applyTheme() {
        if (state.theme === 'light') {
            document.body.classList.add('light-theme');
            elements.themeToggle.innerHTML = '🌙'; // moon icon when in light theme to switch to dark
        } else {
            document.body.classList.remove('light-theme');
            elements.themeToggle.innerHTML = '☀️'; // sun icon when in dark theme to switch to light
        }
    }

    // Save and Load settings in localStorage
    function saveStateToLocalStorage() {
        const settingsToSave = {
            theme: state.theme,
            fontFamily: state.fontFamily,
            fontSize: state.fontSize,
            lineHeight: state.lineHeight,
            letterSpacing: state.letterSpacing,
            wordSpacing: state.wordSpacing,
            paperSize: state.paperSize,
            paperTemplate: state.paperTemplate,
            inkColor: state.inkColor,
            wordJitter: state.wordJitter,
            lineJitter: state.lineJitter,
            marginLeft: state.marginLeft,
            marginTop: state.marginTop,
            marginRight: state.marginRight,
            marginBottom: state.marginBottom
        };
        localStorage.setItem('text_to_handwriting_settings', JSON.stringify(settingsToSave));
    }

    function loadSavedState() {
        elements.textInput.value = state.text;
        const saved = localStorage.getItem('text_to_handwriting_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                Object.assign(state, parsed);
            } catch (e) {
                console.error("Error parsing saved settings", e);
            }
        }
    }

    // Sync HTML input controls visual positions with the State
    function syncControlsWithState() {
        elements.fontSelect.value = state.fontFamily;
        
        elements.fontSizeSlider.value = state.fontSize;
        elements.fontSizeVal.textContent = state.fontSize + 'px';
        
        elements.lineHeightSlider.value = state.lineHeight;
        elements.lineHeightVal.textContent = state.lineHeight + 'px';
        document.documentElement.style.setProperty('--line-height', `${state.lineHeight}px`);
        
        elements.letterSpacingSlider.value = state.letterSpacing;
        elements.letterSpacingVal.textContent = state.letterSpacing + 'px';
        
        elements.wordSpacingSlider.value = state.wordSpacing;
        elements.wordSpacingVal.textContent = state.wordSpacing + 'em';
        
        elements.wordJitterSlider.value = state.wordJitter;
        elements.wordJitterVal.textContent = state.wordJitter + '°';
        
        elements.lineJitterSlider.value = state.lineJitter;
        elements.lineJitterVal.textContent = state.lineJitter + 'px';

        elements.marginLeftSlider.value = state.marginLeft;
        elements.marginLeftVal.textContent = state.marginLeft + 'px';
        document.documentElement.style.setProperty('--margin-left', `${state.marginLeft}px`);

        elements.marginTopSlider.value = state.marginTop;
        elements.marginTopVal.textContent = state.marginTop + 'px';
        document.documentElement.style.setProperty('--margin-top', `${state.marginTop}px`);

        elements.marginRightSlider.value = state.marginRight;
        elements.marginRightVal.textContent = state.marginRight + 'px';
        document.documentElement.style.setProperty('--margin-right', `${state.marginRight}px`);

        elements.marginBottomSlider.value = state.marginBottom;
        elements.marginBottomVal.textContent = state.marginBottom + 'px';
        document.documentElement.style.setProperty('--margin-bottom', `${state.marginBottom}px`);

        elements.paperSizeSelect.value = state.paperSize;
        updatePaperDimensions();
        
        elements.paperTemplateSelect.value = state.paperTemplate;
        elements.scannerEffectCheckbox.checked = state.scannerEffect;

        if (elements.paperTextureSelect) {
            elements.paperTextureSelect.value = state.paperTexture;
        }
        if (elements.mistakeSlider) {
            elements.mistakeSlider.value = state.mistakeFrequency;
            elements.mistakeVal.textContent = state.mistakeFrequency + '%';
        }
        
        // Setup Ink Color presets active border
        let matched = false;
        elements.colorPresets.forEach(preset => {
            const c = preset.getAttribute('data-color');
            if (c.toLowerCase() === state.inkColor.toLowerCase()) {
                preset.classList.add('active');
                matched = true;
            } else {
                preset.classList.remove('active');
            }
        });
        elements.customColorInput.value = state.inkColor;
    }

    function updatePaperDimensions() {
        const dims = paperDimensions[state.paperSize];
        if (dims) {
            document.documentElement.style.setProperty('--paper-width', `${dims.width}px`);
            document.documentElement.style.setProperty('--paper-height', `${dims.height}px`);
        }
    }

    // Dynamic Font Registration (TTF/OTF files)
    function handleFontUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const fontName = 'CustomFont_' + Date.now();
            const arrayBuffer = event.target.result;
            
            const fontFace = new FontFace(fontName, arrayBuffer);
            fontFace.load().then(function (loadedFace) {
                document.fonts.add(loadedFace);
                
                // Add to select dropdown
                const opt = document.createElement('option');
                opt.value = `'${fontName}', sans-serif`;
                opt.textContent = `Uploaded Font (${file.name.substring(0, 10)}...)`;
                elements.fontSelect.appendChild(opt);
                
                // Set active font
                state.fontFamily = opt.value;
                elements.fontSelect.value = opt.value;
                
                // Save custom font record
                state.uploadedFonts.push({
                    name: fontName,
                    fileName: file.name
                });
                
                renderFontBadges();
                triggerRender();
            }).catch(function (error) {
                alert("Failed to load font file. Please ensure it is a valid TTF or OTF file.");
                console.error("Font load error", error);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function renderFontBadges() {
        elements.fontBadgeContainer.innerHTML = '';
        state.uploadedFonts.forEach((font, index) => {
            const badge = document.createElement('div');
            badge.className = 'font-badge';
            badge.innerHTML = `
                <span>✏️ ${font.fileName.substring(0, 12)}</span>
                <button data-index="${index}">&times;</button>
            `;
            badge.querySelector('button').addEventListener('click', function(e) {
                const idx = parseInt(e.target.getAttribute('data-index'));
                state.uploadedFonts.splice(idx, 1);
                // Reset select list option
                const optionToRemove = Array.from(elements.fontSelect.options).find(opt => opt.value.includes(font.name));
                if (optionToRemove) {
                    elements.fontSelect.removeChild(optionToRemove);
                }
                // Re-evaluate current font
                if (state.fontFamily.includes(font.name)) {
                    state.fontFamily = "'Caveat', cursive";
                    elements.fontSelect.value = state.fontFamily;
                }
                renderFontBadges();
                triggerRender();
            });
            elements.fontBadgeContainer.appendChild(badge);
        });
    }

    // --- CORE RENDERING & PAGINATION ENGINE ---
    
    // Debounce function to prevent heavy layout recalculations
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Queue render execution
    function triggerRender() {
        updateSketchColorMatrix();
        saveStateToLocalStorage();
        renderDocument();
    }

    // Convert hex color to SVG Color Matrix to match sketch drawings to handwriting ink
    function updateSketchColorMatrix() {
        const hex = state.inkColor || '#0011ff';
        let r = 0, g = 0, b = 255;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        
        const rn = r / 255;
        const gn = g / 255;
        const bn = b / 255;
        
        const matrixEl = document.getElementById('sketch-recolor-matrix');
        if (matrixEl) {
            const matrixValues = [
                (1 - rn).toFixed(3), 0, 0, 0, rn.toFixed(3),
                0, (1 - gn).toFixed(3), 0, 0, gn.toFixed(3),
                0, 0, (1 - bn).toFixed(3), 0, bn.toFixed(3),
                0, 0, 0, 1, 0
            ].join(' ');
            matrixEl.setAttribute('values', matrixValues);
        }
    }

    // Helper functions for page element creation
    function createPageElement(pageNum) {
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page-wrapper';
        
        const pageTitle = document.createElement('div');
        pageTitle.className = 'page-wrapper-title';
        pageTitle.style.display = 'flex';
        pageTitle.style.justifyContent = 'space-between';
        pageTitle.style.alignItems = 'center';
        pageTitle.style.width = 'var(--paper-width)';
        
        const titleText = document.createElement('span');
        titleText.textContent = `Page ${pageNum}`;
        pageTitle.appendChild(titleText);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️ Delete';
        deleteBtn.className = 'btn-secondary';
        deleteBtn.style.padding = '2px 8px';
        deleteBtn.style.fontSize = '10px';
        deleteBtn.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        deleteBtn.style.color = 'var(--danger-color)';
        deleteBtn.style.background = 'rgba(239, 68, 68, 0.05)';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.borderRadius = 'var(--border-radius-sm)';
        deleteBtn.style.display = 'inline-flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.gap = '4px';
        deleteBtn.title = `Delete Page ${pageNum} content`;
        
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete all text on Page ${pageNum}?`)) {
                deletePage(pageNum);
            }
        });
        
        pageTitle.appendChild(deleteBtn);
        pageWrapper.appendChild(pageTitle);

        const page = document.createElement('div');
        page.className = 'paper-page';
        
        // Set templates
        if (state.paperTemplate === 'plain') {
            page.classList.add('paper-plain');
        } else if (state.paperTemplate === 'grid') {
            page.classList.add('paper-grid');
        } else if (state.paperTemplate === 'margin-only') {
            page.classList.add('paper-margin-only');
        }
        
        // Custom background overrides
        if (state.customBgDataUrl) {
            if (state.paperTemplate === 'margin-only') {
                page.style.backgroundImage = `
                    linear-gradient(to right, transparent calc(var(--margin-left) - 1.5px), var(--margin-red-color) calc(var(--margin-left) - 1.5px), var(--margin-red-color) calc(var(--margin-left) + 0.5px), transparent calc(var(--margin-left) + 0.5px)),
                    url(${state.customBgDataUrl})
                `;
                page.style.backgroundSize = `100% 100%, cover`;
                page.style.backgroundPosition = `0 0, center`;
                page.style.backgroundRepeat = `no-repeat, no-repeat`;
            } else if (state.paperTemplate === 'plain') {
                page.style.backgroundImage = `url(${state.customBgDataUrl})`;
                page.style.backgroundSize = `cover`;
                page.style.backgroundPosition = `center`;
                page.style.backgroundRepeat = `no-repeat`;
            } else if (state.paperTemplate === 'grid') {
                page.style.backgroundImage = `
                    linear-gradient(to right, var(--ruled-line-color) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--ruled-line-color) 1px, transparent 1px),
                    url(${state.customBgDataUrl})
                `;
                page.style.backgroundSize = `var(--line-height) 100%, 100% var(--line-height), cover`;
                page.style.backgroundPosition = `0 0, 0 0, center`;
                page.style.backgroundRepeat = `repeat, repeat, no-repeat`;
            } else {
                page.style.backgroundImage = `
                    linear-gradient(to right, transparent calc(var(--margin-left) - 1.5px), var(--margin-red-color) calc(var(--margin-left) - 1.5px), var(--margin-red-color) calc(var(--margin-left) + 0.5px), transparent calc(var(--margin-left) + 0.5px)),
                    linear-gradient(to bottom, var(--ruled-line-color) 1px, transparent 1px),
                    url(${state.customBgDataUrl})
                `;
                page.style.backgroundSize = `100% 100%, 100% var(--line-height), cover`;
                page.style.backgroundPosition = `0 0, 0 var(--margin-top), center`;
                page.style.backgroundRepeat = `no-repeat, repeat, no-repeat`;
            }
        }

        // Apply scanners
        if (state.scannerEffect) {
            page.classList.add('scanner-effect');
        }

        if (state.showMarginHelper) {
            page.classList.add('margin-highlight');
        }

        // Apply paper texture overrides
        if (state.paperTexture && state.paperTexture !== 'none') {
            page.classList.add(`texture-${state.paperTexture}`);
        }

        // Generate spiral binder loops if selected
        if (state.paperTexture === 'spiral') {
            const binder = document.createElement('div');
            binder.className = 'spiral-binder-overlay';
            // Build 18 binder loops down the left notebook spine
            for (let r = 0; r < 18; r++) {
                const ring = document.createElement('div');
                ring.className = 'spiral-ring';
                binder.appendChild(ring);
            }
            pageWrapper.appendChild(binder);
        }

        // Create margin guide elements
        const guideTop = document.createElement('div');
        guideTop.className = 'margin-guide margin-guide-top';
        const guideLeft = document.createElement('div');
        guideLeft.className = 'margin-guide margin-guide-left';
        const guideRight = document.createElement('div');
        guideRight.className = 'margin-guide margin-guide-right';
        const guideBottom = document.createElement('div');
        guideBottom.className = 'margin-guide margin-guide-bottom';

        page.appendChild(guideTop);
        page.appendChild(guideLeft);
        page.appendChild(guideRight);
        page.appendChild(guideBottom);

        attachMarginDrag(guideTop, 'top', page);
        attachMarginDrag(guideLeft, 'left', page);
        attachMarginDrag(guideRight, 'right', page);
        attachMarginDrag(guideBottom, 'bottom', page);

        const content = document.createElement('div');
        content.className = 'paper-content';
        content.setAttribute('contenteditable', 'true');
        content.style.fontFamily = state.fontFamily;
        content.style.fontSize = `${state.fontSize}px`;
        content.style.lineHeight = `${state.lineHeight}px`;
        content.style.letterSpacing = `${state.letterSpacing}px`;
        content.style.color = state.inkColor;
        
        // Add contenteditable events
        content.addEventListener('blur', function() {
            const changed = syncTextFromEditable();
            if (changed) {
                let hasOverflow = false;
                const pages = document.querySelectorAll('.paper-content');
                const dims = paperDimensions[state.paperSize];
                const maxHeight = dims.height - state.marginTop - state.marginBottom;
                
                pages.forEach(p => {
                    if (p.scrollHeight > maxHeight) {
                        hasOverflow = true;
                    }
                });
                
                const textShortened = state.text.length < (window.lastRenderedTextLength || 0) - 10;
                
                if (hasOverflow || textShortened) {
                    triggerRender();
                }
            }
        });

        // Sync text while typing, but don't reflow until blurred or after delay
        content.addEventListener('input', debounce(function() {
            syncTextFromEditable();
        }, 500));

        content.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                document.execCommand('insertText', false, '\n[page-break]\n');
                syncTextFromEditable();
                const pagesBefore = document.querySelectorAll('.paper-content').length;
                triggerRender();
                // Defer focus to let DOM settle after full re-render
                setTimeout(() => {
                    const pagesAfter = document.querySelectorAll('.paper-content');
                    if (pagesAfter.length > pagesBefore) {
                        const newPage = pagesAfter[pagesAfter.length - 1];
                        newPage.focus();
                        newPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 50);
            }
        });
        
        const numIndicator = document.createElement('div');
        numIndicator.className = 'page-number-indicator';
        numIndicator.textContent = pageNum;
        
        page.appendChild(content);
        page.appendChild(numIndicator);
        pageWrapper.appendChild(page);
        
        elements.previewContainer.appendChild(pageWrapper);
        
        return {
            wrapper: pageWrapper,
            page: page,
            content: content
        };
    }

    let pageParagraphMap = {};
    let activeDrag = null;

    function attachMarginDrag(guideEl, side, pageEl) {
        function onStart(e) {
            e.preventDefault();
            
            // Set guide as active dragging
            activeDrag = {
                guide: guideEl,
                side: side,
                page: pageEl,
                startVal: state[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`],
                startX: e.clientX || (e.touches && e.touches[0].clientX),
                startY: e.clientY || (e.touches && e.touches[0].clientY),
                rect: pageEl.getBoundingClientRect()
            };
            
            guideEl.classList.add('dragging');
            
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        }
        
        function onMove(e) {
            if (!activeDrag) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            let newVal;
            
            if (side === 'left') {
                const clickXOnPage = clientX - activeDrag.rect.left;
                newVal = Math.round(clickXOnPage);
                newVal = Math.max(20, Math.min(200, newVal));
                state.marginLeft = newVal;
                elements.marginLeftSlider.value = newVal;
                elements.marginLeftVal.textContent = newVal + 'px';
                document.documentElement.style.setProperty('--margin-left', `${newVal}px`);
            } 
            else if (side === 'right') {
                const clickXFromRight = activeDrag.rect.right - clientX;
                newVal = Math.round(clickXFromRight);
                newVal = Math.max(10, Math.min(150, newVal));
                state.marginRight = newVal;
                elements.marginRightSlider.value = newVal;
                elements.marginRightVal.textContent = newVal + 'px';
                document.documentElement.style.setProperty('--margin-right', `${newVal}px`);
            } 
            else if (side === 'top') {
                const clickYOnPage = clientY - activeDrag.rect.top;
                newVal = Math.round(clickYOnPage);
                newVal = Math.max(20, Math.min(200, newVal));
                state.marginTop = newVal;
                elements.marginTopSlider.value = newVal;
                elements.marginTopVal.textContent = newVal + 'px';
                document.documentElement.style.setProperty('--margin-top', `${newVal}px`);
            } 
            else if (side === 'bottom') {
                const clickYFromBottom = activeDrag.rect.bottom - clientY;
                newVal = Math.round(clickYFromBottom);
                newVal = Math.max(20, Math.min(200, newVal));
                state.marginBottom = newVal;
                elements.marginBottomSlider.value = newVal;
                elements.marginBottomVal.textContent = newVal + 'px';
                document.documentElement.style.setProperty('--margin-bottom', `${newVal}px`);
            }
            
            throttledRender();
        }
        
        function onEnd() {
            if (!activeDrag) return;
            
            guideEl.classList.remove('dragging');
            activeDrag = null;
            
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            
            triggerRender();
        }
        
        guideEl.addEventListener('mousedown', onStart);
        guideEl.addEventListener('touchstart', onStart);
    }

    const throttledRender = throttle(function() {
        renderDocument();
    }, 40);

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    function extractStyledTokens(node, activeWrappers = []) {
        let tokens = [];
        const inlineTags = ['U', 'B', 'I', 'SPAN', 'FONT', 'EM', 'STRONG', 'MARK', 'STRIKE', 'DEL', 'INS'];
        
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.nodeValue;
                const lines = text.split('\n');
                for (let l = 0; l < lines.length; l++) {
                    if (l > 0) {
                        tokens.push({ type: 'newline' });
                    }
                    const lineText = lines[l];
                    if (lineText === '') continue;
                    
                    const parts = lineText.split(/(\s+)/);
                    parts.forEach(part => {
                        if (part === '') return;
                        const isSpace = /^\s+$/.test(part);
                        
                        if (isSpace) {
                            tokens.push({
                                type: 'space',
                                text: part,
                                wrappers: activeWrappers.map(w => w.cloneNode(false))
                            });
                        } else {
                            // Determine if this word should generate a mistake
                            // Rules: Word must be at least 4 letters, and random check succeeds
                            if (state.mistakeFrequency > 0 && part.length >= 4 && (Math.random() * 100 < state.mistakeFrequency)) {
                                const typo = makeTypo(part);
                                
                                // Create mistake span node
                                const mistakeSpan = document.createElement('span');
                                mistakeSpan.className = 'handwritten-mistake';
                                
                                // Insert typo wrapped in mistake span
                                tokens.push({
                                    type: 'word',
                                    text: typo,
                                    wrappers: [...activeWrappers.map(w => w.cloneNode(false)), mistakeSpan]
                                });
                                
                                // Add spacer space
                                tokens.push({
                                    type: 'space',
                                    text: ' ',
                                    wrappers: activeWrappers.map(w => w.cloneNode(false))
                                });
                            }
                            
                            // Insert correct word
                            tokens.push({
                                type: 'word',
                                text: part,
                                wrappers: activeWrappers.map(w => w.cloneNode(false))
                            });
                        }
                    });
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName;
                if (tagName === 'BR') {
                    tokens.push({ type: 'newline' });
                } else if (tagName === 'DIV' || tagName === 'P') {
                    if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'newline') {
                        tokens.push({ type: 'newline' });
                    }
                    
                    const newWrappers = [...activeWrappers];
                    if (inlineTags.includes(tagName)) {
                        newWrappers.push(child);
                    }
                    
                    tokens = tokens.concat(extractStyledTokens(child, newWrappers));
                    
                    if (tokens.length > 0 && tokens[tokens.length - 1].type !== 'newline') {
                        tokens.push({ type: 'newline' });
                    }
                } else {
                    const newWrappers = [...activeWrappers];
                    if (inlineTags.includes(tagName)) {
                        newWrappers.push(child);
                    }
                    tokens = tokens.concat(extractStyledTokens(child, newWrappers));
                }
            }
        }
        return tokens;
    }

    // Realistic typo generator (swapping adjacent chars, doubling a char, skipping a char)
    function makeTypo(word) {
        if (word.length < 3) return word;
        const rand = Math.random();
        const chars = word.split('');
        
        if (rand < 0.4) {
            // Swap adjacent (keep first letter intact for legibility)
            const idx = Math.floor(Math.random() * (chars.length - 2)) + 1;
            const temp = chars[idx];
            chars[idx] = chars[idx + 1];
            chars[idx + 1] = temp;
        } else if (rand < 0.7) {
            // Duplicate a character
            const idx = Math.floor(Math.random() * (chars.length - 1)) + 1;
            chars.splice(idx, 0, chars[idx]);
        } else {
            // Skip a character
            const idx = Math.floor(Math.random() * (chars.length - 2)) + 1;
            chars.splice(idx, 1);
        }
        return chars.join('');
    }

    function cleanPageHTML(containerNode) {
        const clone = containerNode.cloneNode(true);
        
        const guides = clone.querySelectorAll('.margin-guide');
        guides.forEach(g => g.remove());
        
        const lines = Array.from(clone.querySelectorAll('.handwritten-line'));
        
        const words = clone.querySelectorAll('.handwritten-word');
        words.forEach(word => {
            const textNode = document.createTextNode(word.textContent);
            word.parentNode.replaceChild(textNode, word);
        });
        
        const spaces = clone.querySelectorAll('.handwritten-space');
        spaces.forEach(space => {
            const textNode = document.createTextNode(space.textContent);
            space.parentNode.replaceChild(textNode, space);
        });

        let paragraphsHtml = [];
        lines.forEach(line => {
            paragraphsHtml.push(line.innerHTML);
        });
        
        if (lines.length === 0) {
            return clone.innerHTML;
        }
        
        return paragraphsHtml.join('\n');
    }

    function syncTextFromEditable() {
        const contents = Array.from(document.querySelectorAll('.paper-content'));
        
        let texts = [];
        contents.forEach(contentEl => {
            texts.push(cleanPageHTML(contentEl));
        });

        let combinedText = texts.join('\n');
        const changed = (combinedText !== state.text);
        state.text = combinedText;
        elements.textInput.value = state.text;
        return changed;
    }


    function createLineElement() {
        const line = document.createElement('div');
        line.className = 'handwritten-line';
        line.style.minHeight = `${state.lineHeight}px`;
        return line;
    }

    // Jitter function to calculate slight rotation/translation offsets
    function applyJitter(wordElement) {
        if (state.wordJitter > 0) {
            const rot = (Math.random() - 0.5) * state.wordJitter;
            wordElement.style.setProperty('--word-rotate', `${rot}deg`);
        } else {
            wordElement.style.setProperty('--word-rotate', '0deg');
        }

        if (state.lineJitter > 0) {
            const offY = (Math.random() - 0.5) * state.lineJitter;
            wordElement.style.setProperty('--word-offset-y', `${offY}px`);
        } else {
            wordElement.style.setProperty('--word-offset-y', '0px');
        }

        if (state.wordSpacing !== 0.12) {
            wordElement.style.setProperty('--word-spacing', `${state.wordSpacing}em`);
        } else {
            wordElement.style.setProperty('--word-spacing', '0.05em');
        }
    }

    // Complete UI & Pagination rendering loop
    function renderDocument() {
        // Clear all previous children
        elements.previewContainer.innerHTML = '';
        
        // Clear mapping
        pageParagraphMap = {};
        
        // Calculate max allowed height of paper content box
        const dims = paperDimensions[state.paperSize];
        const maxContentHeight = dims.height - state.marginTop - state.marginBottom;
        
        let pageCount = 1;
        let currentPage = createPageElement(pageCount);
        let currentLine = createLineElement();
        currentPage.content.appendChild(currentLine);

        // Normalize text lines
        const paragraphs = state.text.split('\n');
        
        let justPaged = false;

        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
            const paraText = paragraphs[pIdx];
            
            // Check for manual page-break marker
            if (paraText.trim() === '[page-break]') {
                pageCount++;
                currentPage = createPageElement(pageCount);
                currentLine = createLineElement();
                currentPage.content.appendChild(currentLine);
                justPaged = true;
                continue;
            }
            
            // Record paragraph mapping
            if (!pageParagraphMap[pageCount]) {
                pageParagraphMap[pageCount] = [];
            }
            pageParagraphMap[pageCount].push(pIdx);
            
            // Handle Paragraph Breaks (explicit enter key)
            if (pIdx > 0 && !justPaged) {
                currentLine = createLineElement();
                currentPage.content.appendChild(currentLine);
                
                // If adding a line causes overflow
                if (currentPage.content.scrollHeight > maxContentHeight) {
                    // Start new page
                    pageCount++;
                    currentPage = createPageElement(pageCount);
                    currentLine = createLineElement();
                    currentPage.content.appendChild(currentLine);
                }
            }
            
            justPaged = false;

            // Parse HTML paragraph into styled tokens
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paraText.trim() === '' ? '&nbsp;' : paraText;
            const tokens = extractStyledTokens(tempDiv);
            
            for (const token of tokens) {
                if (token.type === 'newline') {
                    currentLine = createLineElement();
                    currentPage.content.appendChild(currentLine);
                    if (currentPage.content.scrollHeight > maxContentHeight) {
                        pageCount++;
                        currentPage = createPageElement(pageCount);
                        currentLine = createLineElement();
                        currentPage.content.appendChild(currentLine);
                    }
                    continue;
                }
                
                const tokenEl = document.createElement('span');
                
                if (token.type === 'space') {
                    tokenEl.className = 'handwritten-space';
                    tokenEl.textContent = token.text;
                    
                    let elementToAppend = tokenEl;
                    for (let wIdx = token.wrappers.length - 1; wIdx >= 0; wIdx--) {
                        const wrapperClone = token.wrappers[wIdx].cloneNode(false);
                        wrapperClone.appendChild(elementToAppend);
                        elementToAppend = wrapperClone;
                    }
                    currentLine.appendChild(elementToAppend);
                } else {
                    tokenEl.className = 'handwritten-word';
                    tokenEl.textContent = token.text;
                    applyJitter(tokenEl);
                    
                    let elementToAppend = tokenEl;
                    for (let wIdx = token.wrappers.length - 1; wIdx >= 0; wIdx--) {
                        const wrapperClone = token.wrappers[wIdx].cloneNode(false);
                        wrapperClone.appendChild(elementToAppend);
                        elementToAppend = wrapperClone;
                    }
                    currentLine.appendChild(elementToAppend);
                    
                    // Measure content block size
                    if (currentPage.content.scrollHeight > maxContentHeight) {
                        currentLine.removeChild(elementToAppend);
                        
                        if (currentLine.children.length > 0) {
                            pageCount++;
                            currentPage = createPageElement(pageCount);
                            currentLine = createLineElement();
                            currentPage.content.appendChild(currentLine);
                            currentLine.appendChild(elementToAppend);
                        } else {
                            currentPage.content.removeChild(currentLine);
                            pageCount++;
                            currentPage = createPageElement(pageCount);
                            currentPage.content.appendChild(currentLine);
                            currentLine.appendChild(elementToAppend);
                        }
                        
                        if (!pageParagraphMap[pageCount]) {
                            pageParagraphMap[pageCount] = [];
                        }
                        pageParagraphMap[pageCount].push(pIdx);
                    }
                }
            }
        }
        window.lastRenderedTextLength = state.text.length;
        autoScalePages();
    }

    // Auto-scale pages to fit workspace container perfectly without cutoffs
    function autoScalePages() {
        const container = elements.previewContainer;
        if (!container) return;
        
        // Take clientWidth (inside borders/paddings) and subtract 40px for visual breathing room
        const containerWidth = container.clientWidth - 40;
        const pages = document.querySelectorAll('.page-wrapper');
        const dims = paperDimensions[state.paperSize];
        if (!dims || !pages.length) return;
        
        const targetWidth = dims.width;
        
        if (containerWidth < targetWidth && containerWidth > 150) {
            const scale = containerWidth / targetWidth;
            pages.forEach(wrapper => {
                // Apply CSS scale transform
                wrapper.style.transform = `scale(${scale})`;
                wrapper.style.transformOrigin = 'top center';
                
                // Adjust layout boundaries to prevent overlapping sheets
                wrapper.style.width = `${dims.width * scale}px`;
                wrapper.style.height = `${(dims.height + 40) * scale}px`;
                wrapper.style.marginBottom = `${12 * scale}px`;
            });
        } else {
            pages.forEach(wrapper => {
                wrapper.style.transform = '';
                wrapper.style.transformOrigin = '';
                wrapper.style.width = '';
                wrapper.style.height = '';
                wrapper.style.marginBottom = '';
            });
        }
    }

    // --- EXPORT FUNCTIONALITY ---

    function showProgress(title, desc, percent) {
        elements.modalTitle.textContent = title;
        elements.modalDesc.textContent = desc;
        elements.progressFill.style.width = `${percent}%`;
        elements.progressText.textContent = `${percent}%`;
        elements.closeModalBtn.style.display = percent === 100 ? 'inline-block' : 'none';
        elements.progressModal.classList.add('active');
    }

    // PNG Export (Downloads a zip if multiple pages, otherwise downloads direct PNG)
    function exportPNG() {
        const pages = document.querySelectorAll('.paper-page');
        if (pages.length === 0) return;

        showProgress("Generating Images", "Preparing render nodes...", 5);
        
        if (pages.length === 1) {
            // Single page download directly
            html2canvas(pages[0], {
                scale: 2.2, // Retina scaling
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
            }).then(canvas => {
                showProgress("Generating Images", "Downloading image file...", 100);
                const link = document.createElement('a');
                link.download = 'handwritten_page.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error(err);
                alert("Rendering failed: " + err.message);
                elements.progressModal.classList.remove('active');
            });
        } else {
            // Multi-page zip compiler
            const zip = new JSZip();
            let renderedCount = 0;
            
            function renderNextPage(idx) {
                if (idx >= pages.length) {
                    showProgress("Generating ZIP", "Compiling package and downloading...", 95);
                    zip.generateAsync({ type: 'blob' }).then(content => {
                        showProgress("Completed", "Package saved successfully!", 100);
                        const link = document.createElement('a');
                        link.download = 'handwritten_pages.zip';
                        link.href = URL.createObjectURL(content);
                        link.click();
                    });
                    return;
                }

                showProgress("Generating Images", `Rendering page ${idx + 1} of ${pages.length}...`, Math.round((idx / pages.length) * 80) + 10);

                html2canvas(pages[idx], {
                    scale: 2.2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null
                }).then(canvas => {
                    canvas.toBlob(blob => {
                        zip.file(`page_${idx + 1}.png`, blob);
                        renderNextPage(idx + 1);
                    }, 'image/png');
                }).catch(err => {
                    console.error(err);
                    alert("Rendering failed on page " + (idx + 1));
                    elements.progressModal.classList.remove('active');
                });
            }

            renderNextPage(0);
        }
    }

    // PDF Export (Concatenates high-res image canvases into a PDF)
    function exportPDF() {
        const pages = document.querySelectorAll('.paper-page');
        if (pages.length === 0) return;

        const { jsPDF } = window.jspdf;
        const dims = paperDimensions[state.paperSize];

        showProgress("Generating PDF", "Initializing document properties...", 5);

        // Define PDF Orientation
        const orientation = dims.height > dims.width ? 'p' : 'l';
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'pt',
            format: dims.jspdf
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        function renderNextPdfPage(idx) {
            if (idx >= pages.length) {
                showProgress("Generating PDF", "Saving PDF file...", 95);
                pdf.save('handwritten_document.pdf');
                showProgress("Completed", "PDF file downloaded successfully!", 100);
                return;
            }

            showProgress("Generating PDF", `Rendering page ${idx + 1} of ${pages.length}...`, Math.round((idx / pages.length) * 80) + 10);

            html2canvas(pages[idx], {
                scale: 2.2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                
                if (idx > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                renderNextPdfPage(idx + 1);
            }).catch(err => {
                console.error(err);
                alert("PDF render failed on page " + (idx + 1));
                elements.progressModal.classList.remove('active');
            });
        }

        renderNextPdfPage(0);
    }

    function handleSelectionChange() {
        const selection = window.getSelection();
        if (selection.isCollapsed) {
            hideFormattingToolbar();
            return;
        }

        // Walk up DOM to verify selection is inside the preview container
        const container = elements.previewContainer;
        let node = selection.anchorNode;
        let isInside = false;
        while (node) {
            if (node === container) { isInside = true; break; }
            node = node.parentNode;
        }
        if (!isInside) { hideFormattingToolbar(); return; }
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) { hideFormattingToolbar(); return; }
        
        const toolbarWidth = 480;
        const toolbarHeight = 52;
        const margin = 12;
        
        let toolbarX = rect.left + (rect.width / 2) - (toolbarWidth / 2);
        // Clamp horizontally so toolbar stays in viewport
        toolbarX = Math.max(margin, Math.min(window.innerWidth - toolbarWidth - margin, toolbarX));
        
        // Prefer above selection; if not enough room, place below
        let toolbarY;
        if (rect.top - toolbarHeight - margin > 0) {
            toolbarY = rect.top - toolbarHeight - margin;
        } else {
            toolbarY = rect.bottom + margin;
        }
        
        showFormattingToolbar(toolbarX, toolbarY);
    }
    
    function showFormattingToolbar(x, y) {
        if (elements.formattingToolbar) {
            elements.formattingToolbar.style.display = 'flex';
            elements.formattingToolbar.style.left = `${x}px`;
            elements.formattingToolbar.style.top = `${y}px`;
        }
    }
    
    function hideFormattingToolbar() {
        if (elements.formattingToolbar) {
            elements.formattingToolbar.style.display = 'none';
        }
    }

    function applyStyleToSelection(styleName, styleValue) {
        // Selection must already be restored before calling this
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        if (sel.toString().trim() === '') return;

        const range = sel.getRangeAt(0);

        // Wrap selected content in a <span> with the given style
        // This works reliably across all browsers without execCommand quirks
        function wrapRangeWithSpan(cssProperty, cssValue) {
            const span = document.createElement('span');
            span.style[cssProperty] = cssValue;
            try {
                range.surroundContents(span);
            } catch (e) {
                // surroundContents fails when selection crosses element boundaries
                // Fall back to extractContents + insert
                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);
                // Re-select the inserted span
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }

        if (styleName === 'font-size') {
            wrapRangeWithSpan('fontSize', styleValue);
        } else if (styleName === 'font-family') {
            wrapRangeWithSpan('fontFamily', styleValue);
        } else if (styleName === 'color') {
            wrapRangeWithSpan('color', styleValue);
        } else if (styleName === 'background-color') {
            wrapRangeWithSpan('backgroundColor', styleValue);
        }

        syncTextFromEditable();
    }

    function insertPageBreak() {
        const textarea = elements.textInput;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        const marker = '\n[page-break]\n';
        
        if (start || start === 0) {
            state.text = text.substring(0, start) + marker + text.substring(end);
            textarea.value = state.text;
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + marker.length;
            }, 0);
        } else {
            state.text += marker;
            textarea.value = state.text;
        }
        
        triggerRender();
    }

    function deletePage(pageNum) {
        const paragraphs = state.text.split('\n');
        const indicesToDelete = new Set(pageParagraphMap[pageNum] || []);
        
        if (indicesToDelete.size === 0) {
            return;
        }
        
        const minIdx = Math.min(...indicesToDelete);
        const maxIdx = Math.max(...indicesToDelete);
        
        if (minIdx > 0 && paragraphs[minIdx - 1].trim() === '[page-break]') {
            indicesToDelete.add(minIdx - 1);
        } else if (maxIdx < paragraphs.length - 1 && paragraphs[maxIdx + 1].trim() === '[page-break]') {
            indicesToDelete.add(maxIdx + 1);
        }
        
        const newParagraphs = paragraphs.filter((_, idx) => !indicesToDelete.has(idx));
        
        state.text = newParagraphs.join('\n');
        elements.textInput.value = state.text;
        
        triggerRender();
    }

    // Run Startup Init
    window.addEventListener('DOMContentLoaded', init);
})();
