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
        fmtImageInput: document.getElementById('fmt-image-input'),
        
        presetHomework: document.getElementById('preset-homework'),
        presetLetter: document.getElementById('preset-letter'),
        presetNotes: document.getElementById('preset-notes'),
        
        lineSlantSlider: document.getElementById('line-slant'),
        lineSlantVal: document.getElementById('line-slant-val'),
        
        fatigueSlider: document.getElementById('fatigue-factor'),
        fatigueVal: document.getElementById('fatigue-val'),
        
        organicNoiseSlider: document.getElementById('organic-noise'),
        organicNoiseVal: document.getElementById('organic-noise-val'),

        inkPressureSlider: document.getElementById('ink-pressure'),
        inkPressureVal: document.getElementById('ink-pressure-val'),
        
        zoomSlider: document.getElementById('zoom-slider'),
        zoomVal: document.getElementById('zoom-value'),
        
        fmtDrawBtn: document.getElementById('fmt-draw-btn'),
        fmtCorrectBtn: document.getElementById('fmt-correct'),
        importFileInput: document.getElementById('import-file-input'),
        inkSwatches: document.querySelectorAll('.ink-swatch'),
        fmtColorCustom: document.getElementById('fmt-color'),
        doodleModal: document.getElementById('doodle-modal'),
        doodleCanvas: document.getElementById('doodle-canvas'),
        doodleClear: document.getElementById('doodle-clear'),
        doodleCancel: document.getElementById('doodle-cancel'),
        doodleSave: document.getElementById('doodle-save'),
        doodleBrushSize: document.getElementById('doodle-brush-size')
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
        
        paperTexture: 'none',
        mistakeFrequency: 0,
        lineSlant: 0,
        fatigueFactor: 0,
        organicNoise: 0,
        inkPressure: 0,
        zoomFactor: 100,
        
        uploadedFonts: []
    };

    // Page Dimensions mapping (at 96 DPI)
    const paperDimensions = {
        a4: { width: 794, height: 1123, jspdf: 'a4' },
        letter: { width: 816, height: 1056, jspdf: 'letter' }
    };

    // Shared reference to hold contenteditable cursor selection range
    let savedRange = null;

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
            debouncedRender();
        }, 400));

        elements.textInput.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                insertPageBreak();
            }
        });

        // Font selection
        elements.fontSelect.addEventListener('change', function (e) {
            state.fontFamily = e.target.value;
            debouncedRender();
        });

        // Sliders & Values Sync — layout-affecting: debounced render
        setupSlider(elements.fontSizeSlider, elements.fontSizeVal, 'fontSize', 'px', debouncedRender);
        setupSlider(elements.lineHeightSlider, elements.lineHeightVal, 'lineHeight', 'px', function(val) {
            document.documentElement.style.setProperty('--line-height', `${val}px`);
            debouncedRender();
        });
        setupSlider(elements.letterSpacingSlider, elements.letterSpacingVal, 'letterSpacing', 'px', debouncedRender);
        setupSlider(elements.wordSpacingSlider, elements.wordSpacingVal, 'wordSpacing', 'em', debouncedRender);

        setupSlider(elements.wordJitterSlider, elements.wordJitterVal, 'wordJitter', '°', debouncedRender);
        setupSlider(elements.lineJitterSlider, elements.lineJitterVal, 'lineJitter', 'px', debouncedRender);

        // Margin sliders — update CSS var live, debounced re-render
        setupSlider(elements.marginLeftSlider, elements.marginLeftVal, 'marginLeft', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-left', `${val}px`);
            debouncedRender();
        });
        setupSlider(elements.marginTopSlider, elements.marginTopVal, 'marginTop', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-top', `${val}px`);
            debouncedRender();
        });
        setupSlider(elements.marginRightSlider, elements.marginRightVal, 'marginRight', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-right', `${val}px`);
            debouncedRender();
        });
        setupSlider(elements.marginBottomSlider, elements.marginBottomVal, 'marginBottom', 'px', function(val) {
            document.documentElement.style.setProperty('--margin-bottom', `${val}px`);
            debouncedRender();
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

        // Ink Colors — CSS-only update, no re-render needed
        elements.colorPresets.forEach(preset => {
            preset.addEventListener('click', function () {
                elements.colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                state.inkColor = preset.getAttribute('data-color');
                elements.customColorInput.value = state.inkColor;
                applyInkColorToPages(state.inkColor);
                saveStateToLocalStorage();
            });
        });

        elements.customColorInput.addEventListener('input', function (e) {
            elements.colorPresets.forEach(p => p.classList.remove('active'));
            state.inkColor = e.target.value;
            applyInkColorToPages(state.inkColor);
            saveStateToLocalStorage();
        });

        // Paper Texture — needs re-render
        elements.paperTextureSelect.addEventListener('change', function (e) {
            state.paperTexture = e.target.value;
            triggerRender();
        });

        // Mistake / Slant / Fatigue / Noise — debounced render
        setupSlider(elements.mistakeSlider, elements.mistakeVal, 'mistakeFrequency', '%', debouncedRender);
        setupSlider(elements.lineSlantSlider, elements.lineSlantVal, 'lineSlant', '°', debouncedRender);
        setupSlider(elements.fatigueSlider, elements.fatigueVal, 'fatigueFactor', '%', debouncedRender);
        setupSlider(elements.organicNoiseSlider, elements.organicNoiseVal, 'organicNoise', '', debouncedRender);

        // Ink Pressure Slider — CSS filter only, no re-render
        if (elements.inkPressureSlider) {
            elements.inkPressureSlider.addEventListener('input', function (e) {
                const level = parseInt(e.target.value);
                state.inkPressure = level;
                elements.inkPressureVal.textContent = level;
                applyInkPressureFilter(level);
            });
        }

        // Import .txt / .docx file
        if (elements.importFileInput) {
            elements.importFileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (!file) return;
                const ext = file.name.split('.').pop().toLowerCase();

                if (ext === 'txt') {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        state.text = ev.target.result;
                        elements.textInput.value = state.text;
                        elements.importFileInput.value = ''; // reset AFTER read
                        triggerRender();
                    };
                    reader.onerror = function () {
                        alert('Could not read file. Please try again.');
                        elements.importFileInput.value = '';
                    };
                    reader.readAsText(file, 'UTF-8');

                } else if (ext === 'docx') {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        if (typeof mammoth === 'undefined') {
                            alert('mammoth.js library not loaded. Please refresh the page and try again.');
                            elements.importFileInput.value = '';
                            return;
                        }
                        mammoth.extractRawValue({ arrayBuffer: ev.target.result })
                            .then(function (result) {
                                state.text = result.value.trim();
                                elements.textInput.value = state.text;
                                elements.importFileInput.value = '';
                                triggerRender();
                            })
                            .catch(function (err) {
                                alert('Could not read .docx file: ' + (err.message || err));
                                elements.importFileInput.value = '';
                            });
                    };
                    reader.onerror = function () {
                        alert('Could not read .docx file. Please try again.');
                        elements.importFileInput.value = '';
                    };
                    reader.readAsArrayBuffer(file);

                } else {
                    alert('Unsupported file type. Please use .txt or .docx');
                    elements.importFileInput.value = '';
                }
            });
        }

        // Ink color swatches — apply color to current selection
        elements.inkSwatches.forEach(function (swatch) {
            swatch.addEventListener('mousedown', function (e) {
                e.preventDefault(); // prevent losing selection
                const color = swatch.dataset.color;
                if (color) applyColorToSelection(color);
            });
        });

        // Custom color picker — apply on change
        if (elements.fmtColorCustom) {
            elements.fmtColorCustom.addEventListener('input', function (e) {
                applyColorToSelection(e.target.value);
            });
        }

        // Correction / Cross-out button
        if (elements.fmtCorrectBtn) {
            elements.fmtCorrectBtn.addEventListener('mousedown', function (e) {
                e.preventDefault();
                applyCorrection();
            });
        }

        // Zoom Slider Listener
        elements.zoomSlider.addEventListener('input', function (e) {
            state.zoomFactor = parseInt(e.target.value);
            elements.zoomVal.textContent = state.zoomFactor + '%';
            autoScalePages();
        });

        // Preset: Homework click listener
        elements.presetHomework.addEventListener('click', function () {
            state.fontFamily = "'Kalam', cursive";
            state.fontSize = 16;
            state.lineHeight = 26;
            state.inkColor = '#111111';
            state.wordJitter = 1.4;
            state.lineJitter = 1.0;
            state.lineSlant = 0.6;
            state.mistakeFrequency = 2.5;
            state.fatigueFactor = 25;
            state.organicNoise = 2;
            state.paperTemplate = 'ruled';
            state.paperTexture = 'crumpled';
            syncControlsWithState();
            triggerRender();
        });

        // Preset: Love Letter click listener
        elements.presetLetter.addEventListener('click', function () {
            state.fontFamily = "'Homemade Apple', cursive";
            state.fontSize = 19;
            state.lineHeight = 32;
            state.inkColor = '#7f1d1d'; // Crimson red
            state.wordJitter = 0.3;
            state.lineJitter = 0.2;
            state.lineSlant = -0.4;
            state.mistakeFrequency = 0;
            state.fatigueFactor = 0;
            state.organicNoise = 0;
            state.paperTemplate = 'plain';
            state.paperTexture = 'shadow';
            syncControlsWithState();
            triggerRender();
        });

        // Preset: Tidy Notes click listener
        elements.presetNotes.addEventListener('click', function () {
            state.fontFamily = "'Patrick Hand', cursive";
            state.fontSize = 18;
            state.lineHeight = 28;
            state.inkColor = '#0011ff';
            state.wordJitter = 0.5;
            state.lineJitter = 0.3;
            state.lineSlant = 0;
            state.mistakeFrequency = 0.5;
            state.fatigueFactor = 10;
            state.organicNoise = 0;
            state.paperTemplate = 'ruled';
            state.paperTexture = 'none';
            syncControlsWithState();
            triggerRender();
        });

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

        // --- DOODLE CANVAS DRAWING IMPLEMENTATION ---
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        const canvas = elements.doodleCanvas;
        const ctx = canvas.getContext('2d');

        // Set up brush settings
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            if (e.touches && e.touches.length > 0) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            }
        }

        function startDrawing(e) {
            isDrawing = true;
            const coords = getCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const coords = getCoordinates(e);

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            
            ctx.lineWidth = parseInt(elements.doodleBrushSize.value);
            ctx.strokeStyle = state.inkColor || '#0011ff';
            ctx.stroke();

            lastX = coords.x;
            lastY = coords.y;
        }

        function stopDrawing() {
            isDrawing = false;
        }

        // Mouse listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch listeners
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        // Toggle Drawing Modal
        elements.fmtDrawBtn.addEventListener('click', function () {
            // Fill background white initially
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            elements.doodleModal.classList.add('active');
        });

        // Cancel Drawing
        elements.doodleCancel.addEventListener('click', function () {
            elements.doodleModal.classList.remove('active');
        });

        // Clear Canvas
        elements.doodleClear.addEventListener('click', function () {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        // Save Doodle to Caret Selection Range
        elements.doodleSave.addEventListener('click', function () {
            restoreSelection();
            
            const dataUrl = canvas.toDataURL('image/png');
            
            const img = document.createElement('img');
            img.src = dataUrl;
            img.className = 'ink-colored';
            
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                range.insertNode(img);
                
                const br = document.createElement('br');
                range.insertNode(br);
                
                syncTextFromEditable();
                triggerRender();
            }
            
            elements.doodleModal.classList.remove('active');
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

        function saveSelection() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                savedRange = sel.getRangeAt(0).cloneRange();
            }
        }

        function restoreSelection() {
            if (!savedRange) return;
            const sel = window.getSelection();
            
            // Explicitly restore focus to parent contenteditable container
            let node = savedRange.startContainer;
            while (node && node !== document.body) {
                if (node.classList && node.classList.contains('paper-content')) {
                    node.focus();
                    break;
                }
                node = node.parentNode;
            }
            
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        const toolbarItems = [
            elements.fmtBold, elements.fmtItalic, elements.fmtUnderline,
            elements.fmtHighlight, elements.fmtClear, elements.fmtDrawBtn,
            elements.fmtImageInput
        ];
        toolbarItems.forEach(item => {
            if (item) {
                // Save selection on mousedown BEFORE focus is lost
                item.addEventListener('mousedown', function(e) {
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
            if (sel && sel.rangeCount > 0) {
                const anchor = sel.anchorNode;
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
        // Also fire on mouseup/touchend so a full render always happens after dragging stops
        slider.addEventListener('change', function (e) {
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
            marginBottom: state.marginBottom,
            paperTexture: state.paperTexture,
            mistakeFrequency: state.mistakeFrequency,
            lineSlant: state.lineSlant,
            fatigueFactor: state.fatigueFactor,
            organicNoise: state.organicNoise,
            zoomFactor: state.zoomFactor
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
        if (elements.lineSlantSlider) {
            elements.lineSlantSlider.value = state.lineSlant;
            elements.lineSlantVal.textContent = state.lineSlant + '°';
        }
        if (elements.fatigueSlider) {
            elements.fatigueSlider.value = state.fatigueFactor;
            elements.fatigueVal.textContent = state.fatigueFactor + '%';
        }
        if (elements.organicNoiseSlider) {
            elements.organicNoiseSlider.value = state.organicNoise;
            elements.organicNoiseVal.textContent = state.organicNoise;
        }
        if (elements.inkPressureSlider) {
            elements.inkPressureSlider.value = state.inkPressure || 0;
            elements.inkPressureVal.textContent = state.inkPressure || 0;
        }
        if (elements.zoomSlider) {
            elements.zoomSlider.value = state.zoomFactor;
            elements.zoomVal.textContent = state.zoomFactor + '%';
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

    // Immediate render (use sparingly — only for actions that truly need instant feedback)
    function triggerRender() {
        updateSketchColorMatrix();
        saveStateToLocalStorage();
        renderDocument();
        if (state.inkPressure > 0) applyInkPressureFilter(state.inkPressure);
    }

    // Debounced render — use for sliders and frequent events (waits 380ms after last call)
    const debouncedRender = debounce(triggerRender, 380);

    // Instantly update ink color on all pages without a full re-render
    function applyInkColorToPages(color) {
        updateSketchColorMatrix();
        // Update all paper-content elements
        document.querySelectorAll('.paper-content').forEach(function(el) {
            el.style.color = color;
        });
        // Update all handwritten word spans that use the ink color directly
        document.querySelectorAll('.handwritten-word, .handwritten-space').forEach(function(el) {
            if (!el.style.color || el.style.color === el.closest('.paper-content')?.style.color) {
                el.style.color = color;
            }
        });
        // Re-color any organic noise SVG splatters on the page
        document.querySelectorAll('.noise-svg circle, .noise-svg ellipse, .noise-svg path, .noise-svg polygon').forEach(function(el) {
            el.setAttribute('fill', color);
        });
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

        // Apply organic noise overlays (ink splatters / coffee rings)
        applyOrganicNoise(page, pageNum);

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
        content.style.fontFamily = getFontFamilyWithFallbacks(state.fontFamily);
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
        
        return {
            wrapper: pageWrapper,
            page: page,
            content: content
        };
    }

    // Returns the selected font-family with Bengali script fallback fonts appended.
    // This ensures Bengali characters render correctly even when a Latin font is chosen.
    function getFontFamilyWithFallbacks(fontFamily) {
        const bengaliFallbacks = "'Atma', 'Alkatra', 'Galada', 'Noto Serif Bengali', 'Noto Sans Bengali', sans-serif";
        // If it already contains a Bengali font, don't double-stack
        if (
            fontFamily.includes('Atma') ||
            fontFamily.includes('Alkatra') ||
            fontFamily.includes('Galada') ||
            fontFamily.includes('Noto Serif Bengali') ||
            fontFamily.includes('Noto Sans Bengali')
        ) {
            return fontFamily;
        }
        return `${fontFamily}, ${bengaliFallbacks}`;
    }

    // Seeded random generator for placing noise elements in identical positions on re-renders
    function applyOrganicNoise(pageEl, pageNum) {
        if (!state.organicNoise || state.organicNoise === 0) return;

        const dims = paperDimensions[state.paperSize];
        const width = dims.width;
        const height = dims.height;
        const color = state.inkColor || '#0011ff';

        let seed = pageNum * 77;
        function random() {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        // More splatters per noise level (3x density)
        const totalNoiseCount = state.organicNoise * 3;

        for (let i = 0; i < totalNoiseCount; i++) {
            const el = document.createElement('div');
            el.className = 'ink-splatter-svg';

            const rDeg = Math.floor(random() * 360);
            // Mix of tiny dots, medium blots, and large splatter shapes
            const sizeType = random();
            let size;
            if (sizeType < 0.4) {
                size = Math.floor(random() * 6) + 3;   // tiny dot: 3–8px
            } else if (sizeType < 0.75) {
                size = Math.floor(random() * 14) + 8;  // medium blot: 8–22px
            } else {
                size = Math.floor(random() * 22) + 20; // large splatter: 20–42px
            }

            const posX = Math.floor(random() * (width - size - 40)) + 20;
            const posY = Math.floor(random() * (height - size - 40)) + 20;

            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.left = `${posX}px`;
            el.style.top = `${posY}px`;
            el.style.transform = `rotate(${rDeg}deg)`;

            // Pick a random splatter shape template
            const shapeType = Math.floor(random() * 4);
            let svgContent;

            if (shapeType === 0) {
                // Teardrop splat with satellite drops
                svgContent = `
                    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20,8 Q28,14 26,22 T18,30 T12,22 Q10,12 20,8 Z" fill="${color}" opacity="${(0.5 + random() * 0.4).toFixed(2)}" />
                        <circle cx="30" cy="13" r="${(1 + random() * 2).toFixed(1)}" fill="${color}" opacity="0.7" />
                        <circle cx="10" cy="26" r="${(0.8 + random() * 1.5).toFixed(1)}" fill="${color}" opacity="0.65" />
                        <circle cx="14" cy="10" r="${(0.6 + random() * 1).toFixed(1)}" fill="${color}" opacity="0.6" />
                        <circle cx="27" cy="29" r="${(0.5 + random() * 1.2).toFixed(1)}" fill="${color}" opacity="0.7" />
                    </svg>`;
            } else if (shapeType === 1) {
                // Simple round blot with a smear
                svgContent = `
                    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="20" cy="22" rx="${(8 + random() * 6).toFixed(1)}" ry="${(6 + random() * 5).toFixed(1)}" fill="${color}" opacity="${(0.55 + random() * 0.35).toFixed(2)}" />
                        <ellipse cx="${(22 + random() * 8).toFixed(1)}" cy="${(16 + random() * 6).toFixed(1)}" rx="${(2 + random() * 3).toFixed(1)}" ry="${(1.5 + random() * 2).toFixed(1)}" fill="${color}" opacity="0.5" />
                        <circle cx="${(10 + random() * 6).toFixed(1)}" cy="${(10 + random() * 6).toFixed(1)}" r="${(0.8 + random() * 1.5).toFixed(1)}" fill="${color}" opacity="0.6" />
                    </svg>`;
            } else if (shapeType === 2) {
                // Star-burst splatter
                svgContent = `
                    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20,20 L${(14+random()*4).toFixed(0)},${(6+random()*4).toFixed(0)} L20,20 L${(28+random()*4).toFixed(0)},${(10+random()*4).toFixed(0)} L20,20 L${(32+random()*3).toFixed(0)},${(22+random()*4).toFixed(0)} L20,20 L${(24+random()*4).toFixed(0)},${(32+random()*4).toFixed(0)} L20,20 L${(10+random()*4).toFixed(0)},${(30+random()*4).toFixed(0)} L20,20 L${(6+random()*4).toFixed(0)},${(16+random()*4).toFixed(0)} Z"
                              fill="${color}" opacity="${(0.5 + random() * 0.4).toFixed(2)}" />
                        <circle cx="20" cy="20" r="${(3 + random() * 3).toFixed(1)}" fill="${color}" opacity="0.9" />
                    </svg>`;
            } else {
                // Plain ink dot / micro-drop
                svgContent = `
                    <svg viewBox="0 0 20 20" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="${(5 + random() * 4).toFixed(1)}" fill="${color}" opacity="${(0.6 + random() * 0.35).toFixed(2)}" />
                        <circle cx="${(6 + random() * 8).toFixed(1)}" cy="${(4 + random() * 4).toFixed(1)}" r="${(1 + random() * 1.5).toFixed(1)}" fill="${color}" opacity="0.55" />
                    </svg>`;
            }

            el.innerHTML = svgContent;
            pageEl.appendChild(el);
        }
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

    // Jitter function to calculate slight rotation/translation offsets (updates with writing fatigue progress)
    function applyJitter(wordElement, progress = 0) {
        const fatigueFactor = parseFloat(state.fatigueFactor) || 0;
        const wordJitter = parseFloat(state.wordJitter) || 0;
        const lineJitter = parseFloat(state.lineJitter) || 0;
        const wordSpacing = parseFloat(state.wordSpacing) || 0.05;

        const fatigueMult = 1.0 + (progress * (fatigueFactor / 100));

        if (fatigueFactor > 0) {
            const targetSize = state.fontSize * (1.0 + (progress * (fatigueFactor / 100) * 0.12));
            wordElement.style.fontSize = `${targetSize}px`;
        }

        const activeWordJitter = wordJitter * fatigueMult;
        const rot = activeWordJitter > 0 ? (Math.random() - 0.5) * activeWordJitter : 0;

        const activeLineJitter = lineJitter * fatigueMult;
        const offY = activeLineJitter > 0 ? (Math.random() - 0.5) * activeLineJitter : 0;

        // Store raw values in dataset so applyPostRenderSlants can read them
        wordElement.dataset.rot = rot.toFixed(3);
        wordElement.dataset.offY = offY.toFixed(3);

        // Use transform for rotation and style.top for vertical offset
        // style.top on position:relative inline-block is the most universally reliable method
        wordElement.style.transform = rot !== 0 ? `rotate(${rot.toFixed(3)}deg)` : '';
        wordElement.style.top = offY !== 0 ? `${offY.toFixed(3)}px` : '0px';

        const baseSpacing = wordSpacing !== 0.12 ? wordSpacing : 0.05;
        const activeWordSpacing = baseSpacing * fatigueMult;
        wordElement.style.setProperty('--word-spacing', `${activeWordSpacing}em`);
    }

    // Reusable Canvas 2D context for ultra-fast token width estimation without layout thrashing
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');

    function measureTokenWidth(token) {
        if (token.type === 'space') {
            const spaceCount = token.text.length;
            const wordSpacingEm = parseFloat(state.wordSpacing) || 0.05;
            const wordSpacingPx = wordSpacingEm * state.fontSize;
            return spaceCount * (state.fontSize * 0.28 + wordSpacingPx);
        }
        
        let fontStyle = 'normal';
        let fontWeight = '400';
        let fontSize = state.fontSize;
        let fontFamily = getFontFamilyWithFallbacks(state.fontFamily);

        if (token.wrappers) {
            token.wrappers.forEach(w => {
                if (w.tagName === 'B' || w.tagName === 'STRONG' || w.style?.fontWeight === 'bold') fontWeight = '700';
                if (w.tagName === 'I' || w.tagName === 'EM' || w.style?.fontStyle === 'italic') fontStyle = 'italic';
                if (w.style?.fontSize) fontSize = parseFloat(w.style.fontSize);
            });
        }

        const primaryFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        measureCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${primaryFont}", cursive, sans-serif`;
        
        const baseWidth = measureCtx.measureText(token.text).width;
        const letterSpacing = parseFloat(state.letterSpacing) || 0;
        const letterSpacingTotal = token.text.length * letterSpacing;
        const wordSpacingEm = parseFloat(state.wordSpacing) || 0.05;
        const wordSpacingPx = wordSpacingEm * fontSize;

        return baseWidth + letterSpacingTotal + wordSpacingPx;
    }

    function appendTokenToLine(lineEl, token, pIdx, paragraphsCount) {
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
            lineEl.appendChild(elementToAppend);
        } else {
            tokenEl.className = 'handwritten-word';
            tokenEl.textContent = token.text;
            applyJitter(tokenEl, paragraphsCount > 1 ? pIdx / (paragraphsCount - 1) : 0);
            let elementToAppend = tokenEl;
            for (let wIdx = token.wrappers.length - 1; wIdx >= 0; wIdx--) {
                const wrapperClone = token.wrappers[wIdx].cloneNode(false);
                wrapperClone.appendChild(elementToAppend);
                elementToAppend = wrapperClone;
            }
            lineEl.appendChild(elementToAppend);
        }
    }

    // Complete UI & Pagination rendering loop (Ultra-fast DocumentFragment + zero layout thrashing)
    function renderDocument() {
        elements.previewContainer.innerHTML = '';
        pageParagraphMap = {};

        const dims = paperDimensions[state.paperSize];
        const contentWidth = dims.width - state.marginLeft - state.marginRight;
        const contentHeight = dims.height - state.marginTop - state.marginBottom;
        const maxLinesPerPage = Math.max(1, Math.floor((contentHeight - 12) / state.lineHeight));
        const maxLineWidth = Math.max(100, contentWidth - 24);

        const fragment = document.createDocumentFragment();

        let pageCount = 1;
        let currentPage = createPageElement(pageCount);
        let currentLine = createLineElement();
        currentPage.content.appendChild(currentLine);

        let linesOnCurrentPage = 1;
        let currentLineWidth = 0;

        const paragraphs = state.text.split('\n');
        let justPaged = false;

        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
            const paraText = paragraphs[pIdx];

            if (paraText.trim() === '[page-break]') {
                fragment.appendChild(currentPage.wrapper);
                pageCount++;
                currentPage = createPageElement(pageCount);
                currentLine = createLineElement();
                currentPage.content.appendChild(currentLine);
                linesOnCurrentPage = 1;
                currentLineWidth = 0;
                justPaged = true;
                continue;
            }

            if (!pageParagraphMap[pageCount]) {
                pageParagraphMap[pageCount] = [];
            }
            pageParagraphMap[pageCount].push(pIdx);

            if (pIdx > 0 && !justPaged) {
                linesOnCurrentPage++;
                if (linesOnCurrentPage > maxLinesPerPage) {
                    fragment.appendChild(currentPage.wrapper);
                    pageCount++;
                    currentPage = createPageElement(pageCount);
                    linesOnCurrentPage = 1;
                }
                currentLine = createLineElement();
                currentPage.content.appendChild(currentLine);
                currentLineWidth = 0;
            }
            justPaged = false;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paraText.trim() === '' ? '&nbsp;' : paraText;
            const tokens = extractStyledTokens(tempDiv);

            for (const token of tokens) {
                if (token.type === 'newline') {
                    linesOnCurrentPage++;
                    if (linesOnCurrentPage > maxLinesPerPage) {
                        fragment.appendChild(currentPage.wrapper);
                        pageCount++;
                        currentPage = createPageElement(pageCount);
                        linesOnCurrentPage = 1;
                    }
                    currentLine = createLineElement();
                    currentPage.content.appendChild(currentLine);
                    currentLineWidth = 0;
                    continue;
                }

                const tokenWidth = measureTokenWidth(token);

                if (token.type === 'space') {
                    if (currentLineWidth + tokenWidth <= maxLineWidth) {
                        appendTokenToLine(currentLine, token, pIdx, paragraphs.length);
                        currentLineWidth += tokenWidth;
                    }
                } else { // word
                    if (currentLineWidth + tokenWidth > maxLineWidth && currentLineWidth > 0) {
                        linesOnCurrentPage++;
                        if (linesOnCurrentPage > maxLinesPerPage) {
                            fragment.appendChild(currentPage.wrapper);
                            pageCount++;
                            currentPage = createPageElement(pageCount);
                            linesOnCurrentPage = 1;
                        }
                        currentLine = createLineElement();
                        currentPage.content.appendChild(currentLine);
                        currentLineWidth = 0;
                    }

                    appendTokenToLine(currentLine, token, pIdx, paragraphs.length);
                    currentLineWidth += tokenWidth;
                }
            }
        }

        fragment.appendChild(currentPage.wrapper);
        elements.previewContainer.appendChild(fragment);

        window.lastRenderedTextLength = state.text.length;
        applyPostRenderSlants();
        autoScalePages();
    }

    // Post-rendering curved slant pass (starts straight, slopes up/down at the end of the line)
    function applyPostRenderSlants() {
        const lineSlant = parseFloat(state.lineSlant) || 0;
        if (lineSlant === 0) return;
        
        const lines = document.querySelectorAll('.handwritten-line');
        lines.forEach(line => {
            const tokens = Array.from(line.querySelectorAll('.handwritten-word, .handwritten-space'));
            const total = tokens.length;
            if (total <= 2) return;

            // Generate deterministic organic variance per line
            let seed = total;
            function random() {
                let x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            }
            const lineVariance = (random() - 0.5) * 0.15;
            const activeSlant = lineSlant + lineVariance;

            tokens.forEach((tok, idx) => {
                const progress = idx / (total - 1);
                
                // Curve: flat at start, curves up/down at the end (progress^2.5)
                // Positive activeSlant = curves upward (negative top offset)
                const slantLift = -1.0 * Math.pow(progress, 2.5) * activeSlant * 5.0;

                // Read base offsets from dataset (set by applyJitter for word elements)
                let baseOffset = parseFloat(tok.dataset.offY);
                if (isNaN(baseOffset)) baseOffset = 0;
                
                let baseRot = parseFloat(tok.dataset.rot);
                if (isNaN(baseRot)) baseRot = 0;

                const newOffset = baseOffset + slantLift;
                const newRot = baseRot + (progress * activeSlant * 0.4);

                // Use style.top for vertical positioning (works universally on position:relative elements)
                tok.style.top = `${newOffset.toFixed(3)}px`;
                tok.style.transform = newRot !== 0 ? `rotate(${newRot.toFixed(3)}deg)` : '';
            });
        });
    }

    // Auto-scale pages to fit workspace container perfectly without cutoffs, incorporating zoom slider
    function autoScalePages() {
        const container = elements.previewContainer;
        if (!container) return;
        
        const containerWidth = container.clientWidth - 40;
        const pages = document.querySelectorAll('.page-wrapper');
        const dims = paperDimensions[state.paperSize];
        if (!dims || !pages.length) return;
        
        const targetWidth = dims.width;
        
        // Base scale scales down if container is smaller than paper size
        let baseScale = 1.0;
        if (containerWidth < targetWidth && containerWidth > 150) {
            baseScale = containerWidth / targetWidth;
        }

        // Apply zoom factor multiplier
        const scale = baseScale * (state.zoomFactor / 100);
        
        pages.forEach(wrapper => {
            wrapper.style.transform = `scale(${scale})`;
            wrapper.style.transformOrigin = 'top center';
            
            // Adjust layout boundaries to prevent overlapping sheets
            wrapper.style.width = `${dims.width * scale}px`;
            wrapper.style.height = `${(dims.height + 40) * scale}px`;
            wrapper.style.marginBottom = `${12 * scale}px`;
        });
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

    // Apply an ink color to the currently selected text on the page
    function applyColorToSelection(color) {
        restoreSelection();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.toString().trim() === '') return;
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color;
        try {
            range.surroundContents(span);
        } catch (e) {
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
        syncTextFromEditable();
    }

    // Apply a realistic pen cross-out (correction mark) to selected text
    function applyCorrection() {
        restoreSelection();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.toString().trim() === '') return;
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'hw-correction';
        // Match current ink color for the strikethrough
        span.style.textDecorationColor = state.inkColor || '#0011ff';
        span.style.color = state.inkColor || '#0011ff';
        try {
            range.surroundContents(span);
        } catch (e) {
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);
        }
        syncTextFromEditable();
    }

    // Apply / remove the ink pressure SVG filter on all pages based on slider level (0 = off)
    function applyInkPressureFilter(level) {
        // Apply to the full page wrapper so the effect covers everything on the page
        const pages = document.querySelectorAll('.page-wrapper');
        const dispEl = document.getElementById('pressure-displacement');
        const morphEl = document.getElementById('pressure-morphology');
        const turbEl = document.getElementById('pressure-turbulence');

        // Much larger scales so the effect is clearly visible:
        // level 1=5px, 2=10px, 3=15px, 4=20px, 5=28px displacement
        const dispScale = level === 0 ? 0 : Math.round(level * 5.5);
        // Erode slightly at levels 3+ to simulate ink pressure thinning
        const erodeRadius = level >= 3 ? (level - 2) * 0.15 : 0;
        // Increase turbulence frequency with level for more chaotic pressure
        const baseFreq = 0.018 + (level * 0.006);

        if (dispEl) dispEl.setAttribute('scale', dispScale);
        if (morphEl) morphEl.setAttribute('radius', erodeRadius.toFixed(2));
        if (turbEl) turbEl.setAttribute('baseFrequency', `${baseFreq.toFixed(4)} ${(baseFreq * 1.4).toFixed(4)}`);

        pages.forEach(function (page) {
            if (level === 0) {
                page.style.filter = '';
            } else {
                page.style.filter = 'url(#ink-pressure)';
            }
        });
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
