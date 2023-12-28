// Function to escape special characters in a string for use in a regular expression
    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function batchReplaceTextOccurrences(replacements) {
        const nodesToReplace = [];
        const pageLocation = window.location.href;
        // Collect text nodes and link nodes that need replacement
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        while (walker.nextNode()) {
            if (walker.currentNode.nodeType === Node.TEXT_NODE) {
                nodesToReplace.push({
                    node: walker.currentNode,
                    isLink: false
                });
            } else if (walker.currentNode.nodeName === 'A') {
                nodesToReplace.push({
                    node: walker.currentNode,
                    isLink: true
                });
            }
        }

        // Perform batch replacements
        nodesToReplace.forEach(({ node, isLink }) => {
            if (isLink) {
                const linkTextContent = node.textContent;
                const replacedLinkTextContent = replaceText(linkTextContent, replacements, pageLocation);
                
                if (replacedLinkTextContent !== linkTextContent) {
                    const newNode = document.createElement('a');
                    newNode.href = node.getAttribute('href');
                    newNode.textContent = replacedLinkTextContent;
                    node.parentNode.replaceChild(newNode, node);
                }
            } else {
                const textContent = node.nodeValue;
                const replacedTextContent = replaceText(textContent, replacements, pageLocation);
                
                if (replacedTextContent !== textContent) {
                    node.nodeValue = replacedTextContent;
                }
            }
        });
    }

    // Function to perform replacements within a given text using the provided replacements array
    function replaceText(text, replacements, pageLocation) {
        replacements.forEach(({ searchText, replacementText }) => {
            const escapedSearchText = escapeRegExp(searchText);
            const regex = new RegExp(`\\b${escapedSearchText}\\b`, 'gi');
            text = text.replace(regex, match => {
                const matchInText = text.substr(match.index, match.length);
                if (matchInText === match) {
                    return replacementText.charAt(0).toUpperCase() + replacementText.slice(1);
                }
                console.log(`Replacing '${match}' with '${replacementText}'`);
                return replacementText;
            });
        });
        return text;
    }

    $("sup").each(function() {
        if ($(this).text() === "®" || "® " ) {
            // Replace <sup> tag with its content
            $(this).replaceWith($(this).text());
        }
    });


    // Language-specific replacements
    const languageCodeMapping = {
        // Mexico Spanish
        'es_mx': [
            { searchText: 'engorde', replacementText: 'engorda' },
            { searchText: 'los terneros', replacementText: 'los becerros' },
            { searchText: 'estrés térmico cíclico', replacementText: 'estrés por calor cíclico' },
            { searchText: 'profesional lácteo', replacementText: 'los profesionales del sector lechero' },
            { searchText: 'eficiencia alimentaria', replacementText: 'eficiencia alimenticia' },
            { searchText: 'pediluvio', replacementText: 'baño de pezuñas' },
            { searchText: 'estrés térmico', replacementText: 'estrés por calor' },
            { searchText: 'novilla', replacementText: 'vaquilla' },
            { searchText: 'rebaño', replacementText: 'ganado' },
            { searchText: 'resultados observacionales', replacementText: 'resultados de las observaciones' },
            { searchText: 'rendimiento', replacementText: 'desempeño' },
            { searchText: 'gambas', replacementText: 'camarón' },
            { searchText: 'oligoelementos', replacementText: 'minerales traza' },
            // ... (other replacements)
        ],
        // Spain Spanish
        'es_es': [
            // Add more replacements as needed
        ],
        // Portuguese
        'pt': [
            { searchText: 'engorde', replacementText: 'engorda' },
            { searchText: 'gado', replacementText: 'ham sandwhich' },
            // Add more replacements as needed
        ]
    };

    // Universal replacements for all language codes including English
    const universalReplacements = [
        // added a space behind all r balls
        // need to to check if a space already exists behind r ball otherwise will be a double space
        { searchText: '®(?![ ])', replacementText: '® ' },

        // Replacing dashes with a space and adding Zinpro behind all products
        { searchText: '4-Plex-', replacementText: '4-Plex ' },
        { searchText: '4-Plex', replacementText: 'Zinpro 4-Plex' },
        { searchText: 'Availa-', replacementText: 'Availa ' },
        { searchText: 'Availa', replacementText: 'Zinpro Availa' },
        { searchText: 'Copro', replacementText: 'Zinpro COPRO' },
        { searchText: 'Microplex', replacementText: 'Zinpro MICROPLEX' },
        { searchText: 'Performance Minerals', replacementText: 'Zinpro Performance Minerals' },
        { searchText: 'Performance Trace Minerals', replacementText: 'Zinpro Performance Minerals' },
        { searchText: 'Lifetime Performance', replacementText: 'Zinpro Lifetime Performance' },

        // replacing Zinpro duplicates with single Zinpro
        { searchText: 'Zinpro Zinpro', replacementText: 'Zinpro' },
        { searchText: 'Zinpro® Zinpro', replacementText: 'Zinpro®' },
        // Add more universal replacements as needed
    ];


    // Get the current URL
    const currentURL = window.location.href;

    // Extract language codes from the languageCodeMapping object
    const allLanguageCodes = Object.keys(languageCodeMapping);

    // Check if the URL contains any language code
    const languageCodeFound = allLanguageCodes.find(languageCode =>
        currentURL.includes(`/${languageCode}/`)
    );

    let zinproReplacementDone = false;

    if (languageCodeFound) {
        const replacements = languageCodeMapping[languageCodeFound].concat(universalReplacements);
        batchReplaceTextOccurrences(replacements);
    } else {
        // Default to universal replacements
        batchReplaceTextOccurrences(universalReplacements);

            // Check if "Zinpro Zinpro" needs to be removed (and ensure it's only done once)
            const bodyHtml = $("body").html();
            if (!zinproReplacementDone && bodyHtml.includes('Zinpro Zinpro')) {
                $("body").html(bodyHtml.replace(/\bZinpro Zinpro\b/g, 'Zinpro'));
                zinproReplacementDone = true;
            }
        
    }