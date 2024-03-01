import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './app/redux/store.tsx';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import log from 'loglevel';
import { initializeApi } from './app/features/ws/wsAPI';

log.setLevel('debug');
await initializeApi();
// As of React 18
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <ChakraProvider theme={theme}>
    <Provider store={store}>
      <App />
    </Provider>
  </ChakraProvider>
);
