import { memo } from 'react';
import loadable from '@loadable/component';

const Chart = loadable(() => import('react-apexcharts'), {
    ssr: false,
    resolveComponent: (components: any) => components.default['default'] as any,
});

export default memo(Chart);
