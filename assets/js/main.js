(function () {
    'use strict';

    // -----------------------------------------------------------------------
    // 1. Theme toggle: cycles light/dark, persists to localStorage, syncs Utterances
    // -----------------------------------------------------------------------
    var themeToggle = document.getElementById('theme-toggle');

    function getEffectiveTheme() {
        var explicit = document.documentElement.getAttribute('data-theme');
        if (explicit === 'dark' || explicit === 'light') {
            return explicit;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function syncUtterances(theme) {
        var iframe = document.querySelector('iframe.utterances-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
                { type: 'set-theme', theme: theme === 'dark' ? 'github-dark' : 'github-light' },
                'https://utteranc.es'
            );
        }
    }

    function syncThemeUI(theme) {
        if (themeToggle) {
            var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
        }
        syncUtterances(theme);
    }

    if (themeToggle) {
        syncThemeUI(getEffectiveTheme());
        themeToggle.addEventListener('click', function () {
            var next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) { }
            syncThemeUI(next);
        });
    }

    window.addEventListener('message', function (event) {
        if (event.origin === 'https://utteranc.es' && document.documentElement.getAttribute('data-theme')) {
            syncUtterances(getEffectiveTheme());
        }
    });

    // -----------------------------------------------------------------------
    // 2. Mobile navigation with Escape and outside-click dismissal
    // -----------------------------------------------------------------------
    var menuToggle = document.getElementById('menu-toggle');
    var header = document.getElementById('masthead');
    if (menuToggle && header) {
        var setMenuOpen = function (open) {
            header.classList.toggle('is-open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        };

        menuToggle.addEventListener('click', function () {
            setMenuOpen(!header.classList.contains('is-open'));
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && header.classList.contains('is-open')) {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });

        document.addEventListener('click', function (e) {
            if (header.classList.contains('is-open') && !header.contains(e.target)) {
                setMenuOpen(false);
            }
        });
    }

    // -----------------------------------------------------------------------
    // 3. Shared full-content search engine + contextual <mark> snippets + Cmd/Ctrl+K modal
    // -----------------------------------------------------------------------
    var searchCache = null;
    var searchPromise = null;
    var searchLoadFailed = false;

    function loadSearchIndex(indexUrl) {
        if (searchCache) return Promise.resolve(searchCache);
        if (!searchPromise) {
            searchPromise = fetch(indexUrl)
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(function (data) {
                    searchCache = data;
                    searchLoadFailed = false;
                    return data;
                })
                .catch(function (err) {
                    searchLoadFailed = true;
                    searchPromise = null;
                    throw err;
                });
        }
        return searchPromise;
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightTerms(text, terms) {
        var safe = escapeHtml(text);
        if (!terms.length) return safe;
        var sorted = terms.slice().sort(function (a, b) { return b.length - a.length; });
        var re = new RegExp('(' + sorted.map(escapeRegex).join('|') + ')', 'gi');
        return safe.replace(re, '<mark>$1</mark>');
    }

    function buildSnippet(post, terms) {
        var excerpt = post.excerpt || '';
        var content = post.content || excerpt;
        var lowerExcerpt = excerpt.toLowerCase();
        var hitInExcerpt = terms.some(function (t) { return lowerExcerpt.indexOf(t) !== -1; });
        if (hitInExcerpt || !content) {
            return excerpt;
        }
        var lowerContent = content.toLowerCase();
        var bestPos = -1;
        for (var i = 0; i < terms.length; i++) {
            var idx = lowerContent.indexOf(terms[i]);
            if (idx !== -1 && (bestPos === -1 || idx < bestPos)) {
                bestPos = idx;
            }
        }
        if (bestPos === -1) return excerpt;
        var start = Math.max(0, bestPos - 65);
        var end = Math.min(content.length, bestPos + 115);
        if (start > 0) {
            var sp = content.indexOf(' ', start);
            if (sp !== -1 && sp < bestPos) start = sp + 1;
        }
        if (end < content.length) {
            var lastSp = content.lastIndexOf(' ', end);
            if (lastSp > bestPos) end = lastSp;
        }
        return (start > 0 ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '');
    }

    function scorePost(post, terms) {
        var title = (post.title || '').toLowerCase();
        var tags = (post.tags || []).join(' ').toLowerCase();
        var body = ((post.excerpt || '') + ' ' + (post.content || '')).toLowerCase();
        var score = 0;

        for (var i = 0; i < terms.length; i++) {
            var t = terms[i];
            var hit = false;
            if (title.indexOf(t) !== -1) { score += 10; hit = true; }
            if (tags.indexOf(t) !== -1)  { score += 6;  hit = true; }
            if (body.indexOf(t) !== -1)  { score += 2;  hit = true; }
            if (!hit) return 0;
        }
        return score;
    }

    function createSearchController(opts) {
        var input = opts.input;
        var status = opts.status;
        var resultsEl = opts.resultsEl;
        var suggestionsEl = opts.suggestionsEl;
        var indexUrl = opts.indexUrl || '/search.json';
        var archiveUrl = opts.archiveUrl || '/archives';
        var tagsUrl = opts.tagsUrl || '/tags/';
        var limit = opts.limit || 20;
        var syncUrl = !!opts.syncUrl;
        var onQueryChange = opts.onQueryChange;
        var debounceTimer = null;
        var selectedIndex = -1;

        function updateSelection(newIndex) {
            var items = resultsEl.querySelectorAll('li.search-result');
            if (!items.length) {
                selectedIndex = -1;
                return;
            }
            if (newIndex < 0) newIndex = items.length - 1;
            if (newIndex >= items.length) newIndex = 0;
            selectedIndex = newIndex;
            items.forEach(function (li, i) {
                li.classList.toggle('is-selected', i === selectedIndex);
            });
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }

        function render(query) {
            var q = query.trim();
            selectedIndex = -1;

            if (onQueryChange) onQueryChange(q);

            if (syncUrl && window.history && window.history.replaceState) {
                var url = new URL(window.location.href);
                if (q) { url.searchParams.set('q', q); } else { url.searchParams.delete('q'); }
                window.history.replaceState(null, '', url.toString());
            }

            if (!q) {
                status.textContent = '';
                resultsEl.innerHTML = '';
                if (suggestionsEl) suggestionsEl.hidden = false;
                return;
            }

            if (suggestionsEl) suggestionsEl.hidden = true;

            if (searchLoadFailed && !searchCache) {
                status.textContent = 'Search unavailable';
                resultsEl.innerHTML =
                    '<li class="search-results__state">' +
                    'Could not load the search index. Try refreshing, or browse the ' +
                    '<a href="' + escapeHtml(archiveUrl) + '">archive</a> or ' +
                    '<a href="' + escapeHtml(tagsUrl) + '">tags</a>.' +
                    '</li>';
                return;
            }

            if (!searchCache) {
                status.textContent = 'Loading search index…';
                loadSearchIndex(indexUrl).then(function () {
                    render(input.value);
                }, function () {
                    render(input.value);
                });
                return;
            }

            var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
            var matches = [];
            for (var i = 0; i < searchCache.length; i++) {
                var s = scorePost(searchCache[i], terms);
                if (s > 0) matches.push({ post: searchCache[i], score: s });
            }

            matches.sort(function (a, b) {
                return b.score - a.score || (b.post.date || '').localeCompare(a.post.date || '');
            });

            if (matches.length === 0) {
                status.textContent = '0 results for "' + q + '"';
                resultsEl.innerHTML =
                    '<li class="search-results__state">' +
                    'No articles matched <strong>"' + escapeHtml(q) + '"</strong>. ' +
                    'Try a broader keyword, <a href="' + escapeHtml(tagsUrl) + '">browse by tag</a>, ' +
                    'or check the <a href="' + escapeHtml(archiveUrl) + '">archive</a>.' +
                    '</li>';
                return;
            }

            var shown = matches.slice(0, limit);
            status.textContent = matches.length > shown.length
                ? 'Showing top ' + shown.length + ' of ' + matches.length + ' results'
                : matches.length + (matches.length === 1 ? ' result' : ' results');

            resultsEl.innerHTML = shown.map(function (m) {
                var p = m.post;
                var snippet = buildSnippet(p, terms);
                var tagsHtml = (p.tags || []).slice(0, 4).map(function (t) {
                    return '<span class="search-result__tag">#' + highlightTerms(t, terms) + '</span>';
                }).join('');
                return (
                    '<li class="search-result">' +
                        '<time class="dt" datetime="' + escapeHtml(p.date) + '">' + escapeHtml(p.pretty_date) + '</time>' +
                        '<div class="search-result__body">' +
                            '<a href="' + escapeHtml(p.url) + '">' + highlightTerms(p.title, terms) + '</a>' +
                            (snippet ? '<p class="search-result__excerpt">' + highlightTerms(snippet, terms) + '</p>' : '') +
                            (tagsHtml ? '<div class="search-result__tags">' + tagsHtml + '</div>' : '') +
                        '</div>' +
                    '</li>'
                );
            }).join('');
        }

        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () { render(input.value); }, 110);
        });
        input.addEventListener('search', function () { render(input.value); });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateSelection(selectedIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateSelection(selectedIndex - 1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                var link = resultsEl.querySelector('li.search-result.is-selected a');
                if (link) {
                    e.preventDefault();
                    window.location.href = link.href;
                }
            }
        });

        if (suggestionsEl) {
            suggestionsEl.addEventListener('click', function (e) {
                var chip = e.target.closest('.search-chip');
                if (!chip) return;
                input.value = chip.getAttribute('data-query');
                input.focus();
                render(input.value);
            });
        }

        return { render: render, ensureLoaded: function () { return loadSearchIndex(indexUrl).catch(function () {}); } };
    }

    // Inline search widgets (/search and /404.html)
    var inlineWidget = document.querySelector('[data-search-widget="true"]');
    if (inlineWidget) {
        var inlineInput = document.getElementById('search-input');
        var seedFromPath = inlineWidget.getAttribute('data-seed-from-path') === 'true';
        var inlineCtrl = createSearchController({
            input: inlineInput,
            status: document.getElementById('search-status'),
            resultsEl: document.getElementById('search-results'),
            suggestionsEl: document.getElementById('search-empty-suggestions'),
            indexUrl: inlineWidget.getAttribute('data-index-url'),
            archiveUrl: inlineWidget.getAttribute('data-archive-url'),
            tagsUrl: inlineWidget.getAttribute('data-tags-url'),
            limit: 20,
            syncUrl: !seedFromPath
        });

        var initialQ = new URLSearchParams(window.location.search).get('q');
        if (!initialQ && seedFromPath) {
            var slugWords = window.location.pathname
                .replace(/\.html$/i, '')
                .split('/')
                .filter(function (seg) { return seg && !/^\d{2,4}$/.test(seg) && seg !== '404'; })
                .pop();
            if (slugWords) {
                initialQ = slugWords.replace(/[-_]+/g, ' ').trim();
            }
        }
        if (initialQ && inlineInput) {
            inlineInput.value = initialQ;
            inlineCtrl.render(initialQ);
        } else {
            inlineCtrl.ensureLoaded();
        }
    }

    // Command-palette modal (#search-dialog)
    var searchDialog = document.getElementById('search-dialog');
    var modalInput = document.getElementById('modal-search-input');
    var modalFullLink = document.getElementById('modal-search-full');
    var modalCtrl = null;

    if (searchDialog && modalInput && typeof searchDialog.showModal === 'function') {
        var baseSearchUrl = searchDialog.getAttribute('data-search-url') || '/search';
        modalCtrl = createSearchController({
            input: modalInput,
            status: document.getElementById('modal-search-status'),
            resultsEl: document.getElementById('modal-search-results'),
            suggestionsEl: document.getElementById('modal-search-suggestions'),
            indexUrl: searchDialog.getAttribute('data-index-url'),
            archiveUrl: searchDialog.getAttribute('data-archive-url'),
            tagsUrl: searchDialog.getAttribute('data-tags-url'),
            limit: 10,
            syncUrl: false,
            onQueryChange: function (q) {
                if (modalFullLink) {
                    modalFullLink.href = q ? baseSearchUrl + '?q=' + encodeURIComponent(q) : baseSearchUrl;
                }
            }
        });

        var openSearchModal = function () {
            if (!searchDialog.open) {
                searchDialog.showModal();
            }
            modalCtrl.ensureLoaded();
            modalInput.focus();
            modalInput.select();
        };

        var closeBtn = searchDialog.querySelector('.search-modal__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () { searchDialog.close(); });
        }

        searchDialog.addEventListener('click', function (e) {
            if (e.target === searchDialog) searchDialog.close();
        });

        var trigger = document.querySelector('.search-trigger');
        if (trigger && !inlineWidget) {
            trigger.addEventListener('click', function (e) {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                openSearchModal();
            });
        }

        document.addEventListener('keydown', function (e) {
            // Cmd+K or Ctrl+K opens search anywhere
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (inlineWidget && document.getElementById('search-input')) {
                    var si = document.getElementById('search-input');
                    si.focus();
                    si.select();
                } else if (searchDialog.open) {
                    searchDialog.close();
                } else {
                    openSearchModal();
                }
                return;
            }
            // "/" outside text inputs
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
            var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
                return;
            }
            e.preventDefault();
            if (inlineWidget && document.getElementById('search-input')) {
                var inp = document.getElementById('search-input');
                inp.focus();
                inp.select();
            } else {
                openSearchModal();
            }
        });
    }

    // -----------------------------------------------------------------------
    // 4. Code blocks: language badge + Copy button + horizontal scroll fade
    // -----------------------------------------------------------------------
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                var ok = document.execCommand('copy');
                document.body.removeChild(ta);
                if (ok) { resolve(); } else { reject(new Error('copy failed')); }
            } catch (err) {
                reject(err);
            }
        });
    }

    var codeWrappers = [];

    function updateCodeFade(wrapper, pre) {
        var overflow = pre.scrollWidth - pre.clientWidth > 4;
        wrapper.classList.toggle('is-scrollable', overflow);
        if (overflow) {
            var atEnd = pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 4;
            wrapper.classList.toggle('is-scrolled-end', atEnd);
        } else {
            wrapper.classList.remove('is-scrolled-end');
        }
    }

    document.querySelectorAll('.article__body pre').forEach(function (pre) {
        var code = pre.querySelector('code');
        if (!code || pre.closest('.code-block')) return;

        var container = pre.closest('.highlighter-rouge, figure.highlight') || pre;
        var langMatch = (container.className + ' ' + code.className).match(/language-([a-z0-9_+-]+)/i);
        var lang = langMatch ? langMatch[1] : '';

        var wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        container.parentNode.insertBefore(wrapper, container);

        var toolbar = document.createElement('div');
        toolbar.className = 'code-block__bar';

        var langLabel = document.createElement('span');
        langLabel.className = 'code-block__lang';
        langLabel.textContent = lang || 'code';

        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'code-block__copy';
        copyBtn.textContent = 'Copy';
        copyBtn.setAttribute('aria-label', 'Copy ' + (lang || 'code') + ' snippet to clipboard');

        copyBtn.addEventListener('click', function () {
            copyText(code.innerText).then(function () {
                copyBtn.textContent = 'Copied';
                copyBtn.classList.add('is-copied');
                setTimeout(function () {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('is-copied');
                }, 2000);
            }, function () {
                copyBtn.textContent = 'Copy failed';
                setTimeout(function () {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });

        toolbar.appendChild(langLabel);
        toolbar.appendChild(copyBtn);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(container);

        codeWrappers.push({ wrapper: wrapper, pre: pre });
        updateCodeFade(wrapper, pre);
        pre.addEventListener('scroll', function () { updateCodeFade(wrapper, pre); }, { passive: true });
    });

    if (codeWrappers.length) {
        window.addEventListener('resize', function () {
            codeWrappers.forEach(function (item) { updateCodeFade(item.wrapper, item.pre); });
        }, { passive: true });
    }

    // -----------------------------------------------------------------------
    // 5. Clickable heading anchors & responsive table scroll wrappers
    // -----------------------------------------------------------------------
    document.querySelectorAll('.article__body h2[id], .article__body h3[id]').forEach(function (heading) {
        var anchor = document.createElement('a');
        anchor.className = 'heading-anchor';
        anchor.href = '#' + heading.id;
        anchor.setAttribute('aria-label', 'Link to section: ' + heading.textContent.trim());
        anchor.textContent = '#';
        heading.appendChild(anchor);
    });

    document.querySelectorAll('.article__body table').forEach(function (table) {
        if (table.closest('.table-scroll')) return;
        var scroller = document.createElement('div');
        scroller.className = 'table-scroll';
        scroller.setAttribute('tabindex', '0');
        scroller.setAttribute('role', 'region');
        scroller.setAttribute('aria-label', 'Scrollable data table');
        table.parentNode.insertBefore(scroller, table);
        scroller.appendChild(table);
    });

    // -----------------------------------------------------------------------
    // 6. Sticky TOC scroll-spy
    // -----------------------------------------------------------------------
    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
    if (tocLinks.length && 'IntersectionObserver' in window) {
        var headingMap = [];
        tocLinks.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            var target = document.getElementById(id);
            if (target) headingMap.push({ id: id, el: target, link: link });
        });

        if (headingMap.length) {
            var setActiveHeading = function (id) {
                headingMap.forEach(function (entry) {
                    var active = entry.id === id;
                    entry.link.classList.toggle('is-active', active);
                    if (active) {
                        entry.link.setAttribute('aria-current', 'location');
                    } else {
                        entry.link.removeAttribute('aria-current');
                    }
                });
            };

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveHeading(entry.target.id);
                    }
                });
            }, { rootMargin: '-12% 0px -75% 0px', threshold: 0 });

            headingMap.forEach(function (entry) { observer.observe(entry.el); });
        }
    }

    // -----------------------------------------------------------------------
    // 7. Click-to-zoom image lightbox for inline technical diagrams/screenshots
    // -----------------------------------------------------------------------
    var lightbox = document.getElementById('image-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    if (lightbox && lightboxImg && typeof lightbox.showModal === 'function') {
        var lbClose = lightbox.querySelector('.lightbox__close');
        if (lbClose) {
            lbClose.addEventListener('click', function () { lightbox.close(); });
        }
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) lightbox.close();
        });

        document.querySelectorAll('.article__body img').forEach(function (img) {
            if (img.closest('a')) return;
            img.classList.add('is-zoomable');
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            var openZoom = function () {
                lightboxImg.src = img.currentSrc || img.src;
                lightboxImg.alt = img.alt || '';
                var fig = img.closest('figure');
                var cap = fig ? fig.querySelector('figcaption') : null;
                lightboxCaption.textContent = cap ? cap.textContent.trim() : (img.alt || '');
                lightbox.showModal();
            };
            img.addEventListener('click', openZoom);
            img.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openZoom();
                }
            });
        });
    }

    // -----------------------------------------------------------------------
    // 8. Reading progress bar & floating Back-to-Top button
    // -----------------------------------------------------------------------
    var progressBar = document.getElementById('reading-progress-bar');
    var articleBody = document.querySelector('.article__body');
    var backToTop = document.getElementById('back-to-top');

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (progressBar || backToTop) {
        var ticking = false;
        var onScroll = function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                ticking = false;
                var scrollY = window.scrollY || window.pageYOffset;

                if (backToTop) {
                    backToTop.hidden = scrollY < 600;
                }

                if (progressBar && articleBody) {
                    var rect = articleBody.getBoundingClientRect();
                    var total = articleBody.offsetHeight - window.innerHeight;
                    var passed = -rect.top;
                    var pct = total > 0 ? Math.max(0, Math.min(100, (passed / total) * 100)) : 0;
                    progressBar.style.width = pct.toFixed(1) + '%';
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        onScroll();
    }
})();
