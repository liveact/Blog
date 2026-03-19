import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * Lightweight rehype plugin that transforms ```mermaid code blocks
 * into <pre class="mermaid"> elements for client-side rendering.
 * Requires excludeLangs: ['mermaid'] in shikiConfig and
 * mermaid.js loaded via CDN in the page head.
 */
export default function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName !== 'pre' ||
        !node.children?.length ||
        !parent ||
        index === undefined
      )
        return

      const code = node.children[0]
      if (
        code.type !== 'element' ||
        code.tagName !== 'code' ||
        !Array.isArray(code.properties?.className)
      )
        return

      const classes = code.properties.className as string[]
      if (!classes.includes('language-mermaid')) return

      const text = getTextContent(code)
      if (!text) return

      parent.children[index] = {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: text }]
      }
    })
  }
}

function getTextContent(node: Element): string {
  let text = ''
  for (const child of node.children) {
    if (child.type === 'text') text += child.value
    else if (child.type === 'element') text += getTextContent(child)
  }
  return text
}
