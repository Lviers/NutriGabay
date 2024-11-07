import { AppRegistry } from 'react-native';
import App from './App'; // Ensure the path to your App component is correct
import { name as appName } from './app.json';

// Register the main application component
AppRegistry.registerComponent(appName, () => App);
