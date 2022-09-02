import React from 'react';
import ReactDOM from 'react-dom/client';

import Panel from './Panel';
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Panel />
    </React.StrictMode>
);
