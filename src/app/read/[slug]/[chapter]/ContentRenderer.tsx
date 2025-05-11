// src/app/read/[slug]/[chapter]/ContentRenderer.tsx
'use client';
import React from 'react';

interface ContentRendererProps {
    contentString: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ contentString }) => {
    if (!contentString) {
        return <p className="text-muted-foreground">Chapter content not available.</p>;
    }

    const paragraphs = contentString.split(/\n\s*\n/); // Split by one or more empty lines

    return (
        <div className="prose dark:prose-invert max-w-none lg:prose-xl prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-border prose-hr:border-border">
            {paragraphs.map((paragraph, pIndex) => {
                if (!paragraph.trim()) return null; 

                // Headings
                if (paragraph.startsWith('### ')) {
                    return <h3 key={pIndex} className="text-xl md:text-2xl font-semibold mt-6 mb-3">{paragraph.substring(4)}</h3>;
                }
                if (paragraph.startsWith('## ')) {
                    return <h2 key={pIndex} className="text-2xl md:text-3xl font-bold mt-8 mb-4">{paragraph.substring(3)}</h2>;
                }
                if (paragraph.startsWith('# ')) {
                    return <h1 key={pIndex} className="text-3xl md:text-4xl font-extrabold mt-10 mb-5">{paragraph.substring(2)}</h1>;
                }

                // Blockquotes
                if (paragraph.startsWith('> ')) {
                    // Remove leading '>' and trim whitespace for each line within the blockquote
                    const blockquoteContent = paragraph.substring(1).trim().split('\n').map(line => line.trim()).join('\n');
                    return <blockquote key={pIndex} className="pl-4 italic border-l-4 my-4">{blockquoteContent}</blockquote>;
                }

                // Horizontal Rule
                if (paragraph.trim() === '---') {
                    return <hr key={pIndex} className="my-8" />;
                }

                // For regular paragraphs, process inline elements
                let segments: (string | JSX.Element)[] = [paragraph];

                // Bold: **text**
                segments = segments.flatMap((segment, sIdx) =>
                    typeof segment === 'string'
                        ? segment.split(/(\*\*.*?\*\*)/g).map((part, partIdx) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                                <strong key={`${pIndex}-strong-${sIdx}-${partIdx}`}>{part.slice(2, -2)}</strong>
                            ) : (
                                part
                            )
                        )
                        : [segment]
                );

                // Italic: *text* or _text_ (handle underscores carefully to avoid conflict with bold)
                segments = segments.flatMap((segment, sIdx) =>
                    typeof segment === 'string'
                        ? segment.split(/((?<![\*_])[*_]{1}[^*_]+?[*_]{1}(?![\*_]))/g).map((part, partIdx) =>
                            (part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_')) ? (
                                <em key={`${pIndex}-em-${sIdx}-${partIdx}`}>{part.slice(1, -1)}</em>
                            ) : (
                                part
                            )
                        )
                        : [segment]
                );
                
                // Strikethrough: ~~text~~
                segments = segments.flatMap((segment, sIdx) =>
                    typeof segment === 'string'
                        ? segment.split(/(~~.*?~~)/g).map((part, partIdx) =>
                            part.startsWith('~~') && part.endsWith('~~') ? (
                                <s key={`${pIndex}-s-${sIdx}-${partIdx}`}>{part.slice(2, -2)}</s>
                            ) : (
                                part
                            )
                        )
                        : [segment]
                );

                return <p key={pIndex} className="mb-4 leading-relaxed text-lg">{segments.map((seg, i) => <React.Fragment key={i}>{seg}</React.Fragment>)}</p>;
            })}
        </div>
    );
};

export default ContentRenderer;
