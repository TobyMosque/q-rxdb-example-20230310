import { defineComponent, h, Suspense, VNode } from 'vue';
import { RouterView, RouteLocationNormalized } from 'vue-router';
import LoadingPage from 'src/components/LoadingPage.vue';

interface RouterViewArgs {
  route: RouteLocationNormalized;
  Component: VNode;
}

export default defineComponent({
  setup() {
    return () =>
      h(RouterView, null, {
        default({ route, Component }: RouterViewArgs) {
          if (Component) {
            const { matched, fullPath } = route;
            const { props, type } = Component;
            const match = matched.find(
              (m) => m.components?.default === type && m.components?.fallback
            );
            if (!match || !match.components) {
              return h(
                Suspense,
                {
                  key: fullPath,
                },
                {
                  default() {
                    return h(Component as never, props);
                  },
                  fallback() {
                    return h(LoadingPage as never, props);
                  },
                }
              );
            }
            const _default = match.components.default;
            const fallback = match.components.fallback;

            let dProps: unknown;
            let fProps: unknown;
            if (match.props) {
              if (typeof match.props === 'boolean') {
                if (match.props) {
                  dProps = props;
                  fProps = props;
                }
              }

              if (typeof match.props === 'object') {
                const { default: _default, fallback } = match.props;
                if (_default && typeof _default === 'boolean') {
                  dProps = props;
                } else {
                  dProps = _default;
                }
                if (fallback && typeof fallback === 'boolean') {
                  fProps = props;
                } else {
                  fProps = fallback;
                }
              }
            }

            return h(
              Suspense,
              {
                key: fullPath,
              },
              {
                default() {
                  return h(_default as never, dProps as never);
                },
                fallback() {
                  return h(fallback as never, fProps as never);
                },
              }
            );
          }
        },
      });
  },
});
