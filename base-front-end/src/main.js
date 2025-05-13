import { registerScreen, navigate } from '@utils/router.js';
import menu from '@/screens/menu.js';
import logger from '@utils/logger.js';
// import play from '@/screens/play.js';

registerScreen('menu', menu);
// registerScreen('play', play);

navigate(location.pathname.slice(1) || 'menu');

window.navigate = navigate;
