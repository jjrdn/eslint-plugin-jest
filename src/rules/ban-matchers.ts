import { createRule, isExpectCall, parseExpectCall } from './utils';

export default createRule<
  [Record<string, string | null>],
  'bannedChain' | 'bannedChainWithMessage'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Bans specific matchers & modifiers from being used',
      recommended: false,
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        additionalProperties: {
          type: ['string', 'null'],
        },
      },
    ],
    messages: {
      bannedChain: '{{ chain }} is banned, and so should not be used',
      bannedChainWithMessage: '{{ message }}',
    },
  },
  defaultOptions: [{}],
  create(context, [bannedChains]) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher, modifier } = parseExpectCall(node);

        if (matcher) {
          const chain = matcher.name;

          if (chain in bannedChains) {
            const message = bannedChains[chain];

            context.report({
              messageId: message ? 'bannedChainWithMessage' : 'bannedChain',
              data: { message, chain },
              node: matcher.node.property,
            });

            return;
          }
        }

        if (modifier) {
          const chain = modifier.name;

          if (chain in bannedChains) {
            const message = bannedChains[chain];

            context.report({
              messageId: message ? 'bannedChainWithMessage' : 'bannedChain',
              data: { message, chain },
              node: modifier.node.property,
            });

            return;
          }
        }

        if (matcher && modifier) {
          const chain = `${modifier.name}.${matcher.name}`;

          if (chain in bannedChains) {
            const message = bannedChains[chain];

            context.report({
              messageId: message ? 'bannedChainWithMessage' : 'bannedChain',
              data: { message, chain },
              loc: {
                start: modifier.node.property.loc.start,
                end: matcher.node.property.loc.end,
              },
            });

            return;
          }
        }
      },
    };
  },
});
