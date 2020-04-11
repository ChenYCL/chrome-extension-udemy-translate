import React from 'react';
import { render } from 'react-dom';

import Newtab from './Newtab';
import './index.scss';

render(<Newtab />, window.document.querySelector('#app-container'));
