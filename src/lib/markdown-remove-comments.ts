import { defineMdastPlugin } from 'satteri';

// Drops HTML comments from Markdown so commented-out drafts aren't published
// (the Jekyll site's minifier used to strip them).
export const removeComments = defineMdastPlugin({
  name: 'remove-comments',
  html(node, ctx) {
    if (/^\s*<!--[\s\S]*-->\s*$/.test(node.value)) {
      ctx.removeNode(node);
    }
  },
});
